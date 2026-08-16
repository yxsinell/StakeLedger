revoke insert, update, delete
  on table public.catalog_teams, public.catalog_competitions, public.catalog_aliases
  from authenticated;

create or replace function public.create_manual_catalog_item(
  p_actor_user_id uuid,
  p_entity_type text,
  p_name text,
  p_country text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_name text := btrim(p_name);
  v_country text := nullif(btrim(p_country), '');
begin
  if p_actor_user_id is null
    or not exists (select 1 from public.users where users.id = p_actor_user_id) then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '28000';
  end if;

  if p_entity_type is null
    or p_name is null
    or p_entity_type not in ('team', 'competition')
    or char_length(v_name) < 1
    or char_length(v_name) > 100
    or char_length(v_country) > 100 then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  if p_entity_type = 'team' then
    insert into public.catalog_teams (
      name, country, normalization_status, created_by
    ) values (
      v_name, v_country, 'manual', p_actor_user_id
    ) returning id into v_id;
  else
    insert into public.catalog_competitions (
      name, sport, country, normalization_status, created_by
    ) values (
      v_name, null, v_country, 'manual', p_actor_user_id
    ) returning id into v_id;
  end if;

  return jsonb_build_object(
    'success', true,
    'item', jsonb_build_object(
      'id', v_id,
      'type', p_entity_type,
      'name', v_name,
      'country', v_country,
      'sport', null,
      'normalizationStatus', 'manual',
      'isNormalized', false,
      'matchedBy', 'manual'
    )
  );
end;
$$;

revoke all on function public.create_manual_catalog_item(uuid, text, text, text)
  from public, anon, authenticated;
grant execute on function public.create_manual_catalog_item(uuid, text, text, text)
  to service_role;

create or replace function public.search_catalog(
  p_entity_type text,
  p_query text,
  p_limit integer default 10,
  p_offset integer default 0
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_query text := lower(btrim(p_query));
  v_pattern text;
  v_result jsonb;
begin
  if (select auth.uid()) is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '28000';
  end if;

  if p_entity_type is null
    or p_query is null
    or p_limit is null
    or p_offset is null
    or p_entity_type not in ('team', 'competition')
    or char_length(v_query) < 2
    or char_length(v_query) > 100
    or p_limit < 1
    or p_limit > 25
    or p_offset < 0
    or p_offset > 10000 then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  v_pattern := replace(replace(replace(v_query, E'\\', E'\\\\'), '%', E'\\%'), '_', E'\\_') || '%';

  if p_entity_type = 'team' then
    with matches as (
      select
        catalog_teams.id,
        catalog_teams.name,
        catalog_teams.country,
        null::text as sport,
        case
          when catalog_teams.normalized_name = v_query then 0
          when catalog_teams.normalized_name like v_pattern escape E'\\' then 1
          else 2
        end as match_rank,
        case
          when catalog_teams.normalized_name like v_pattern escape E'\\' then 'name'
          else 'alias'
        end as matched_by
      from public.catalog_teams
      where catalog_teams.normalization_status = 'normalized'
        and (
          catalog_teams.normalized_name like v_pattern escape E'\\'
          or exists (
            select 1
            from public.catalog_aliases
            where catalog_aliases.team_id = catalog_teams.id
              and catalog_aliases.normalized_alias like v_pattern escape E'\\'
          )
        )
    ), page as (
      select * from matches
      order by match_rank, name, id
      limit p_limit + 1 offset p_offset
    ), numbered as (
      select *, row_number() over (order by match_rank, name, id) as row_number
      from page
    )
    select jsonb_build_object(
      'success', true,
      'items', coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', id,
            'type', 'team',
            'name', name,
            'country', country,
            'sport', sport,
            'normalizationStatus', 'normalized',
            'isNormalized', true,
            'matchedBy', matched_by
          ) order by match_rank, name, id
        ) filter (where row_number <= p_limit),
        '[]'::jsonb
      ),
      'nextOffset', case when count(*) > p_limit then p_offset + p_limit else null end
    ) into v_result
    from numbered;
  else
    with matches as (
      select
        catalog_competitions.id,
        catalog_competitions.name,
        catalog_competitions.country,
        catalog_competitions.sport,
        case
          when catalog_competitions.normalized_name = v_query then 0
          when catalog_competitions.normalized_name like v_pattern escape E'\\' then 1
          else 2
        end as match_rank,
        case
          when catalog_competitions.normalized_name like v_pattern escape E'\\' then 'name'
          else 'alias'
        end as matched_by
      from public.catalog_competitions
      where catalog_competitions.normalization_status = 'normalized'
        and (
          catalog_competitions.normalized_name like v_pattern escape E'\\'
          or exists (
            select 1
            from public.catalog_aliases
            where catalog_aliases.competition_id = catalog_competitions.id
              and catalog_aliases.normalized_alias like v_pattern escape E'\\'
          )
        )
    ), page as (
      select * from matches
      order by match_rank, name, id
      limit p_limit + 1 offset p_offset
    ), numbered as (
      select *, row_number() over (order by match_rank, name, id) as row_number
      from page
    )
    select jsonb_build_object(
      'success', true,
      'items', coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', id,
            'type', 'competition',
            'name', name,
            'country', country,
            'sport', sport,
            'normalizationStatus', 'normalized',
            'isNormalized', true,
            'matchedBy', matched_by
          ) order by match_rank, name, id
        ) filter (where row_number <= p_limit),
        '[]'::jsonb
      ),
      'nextOffset', case when count(*) > p_limit then p_offset + p_limit else null end
    ) into v_result
    from numbered;
  end if;

  return v_result;
end;
$$;

create or replace function public.upsert_catalog_item(
  p_actor_user_id uuid,
  p_entity_type text,
  p_item_id uuid,
  p_name text,
  p_sport text default null,
  p_country text default null,
  p_provider text default null,
  p_external_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_created boolean := false;
  v_name text := btrim(p_name);
  v_sport text := nullif(btrim(p_sport), '');
  v_country text := nullif(btrim(p_country), '');
  v_provider text := nullif(btrim(p_provider), '');
  v_external_id text := nullif(btrim(p_external_id), '');
begin
  if p_actor_user_id is null
    or not exists (
      select 1 from public.users
      where users.id = p_actor_user_id
        and users.role in ('admin', 'editor')
    ) then
    raise exception 'CATALOG_EDITOR_REQUIRED' using errcode = '42501';
  end if;

  if p_entity_type is null
    or p_name is null
    or p_entity_type not in ('team', 'competition')
    or char_length(v_name) < 1
    or char_length(v_name) > 100
    or char_length(v_country) > 100
    or char_length(v_provider) > 50
    or char_length(v_external_id) > 100
    or ((v_provider is null) <> (v_external_id is null))
    or (p_entity_type = 'competition' and (v_sport is null or char_length(v_sport) > 50))
    or (p_entity_type = 'team' and v_sport is not null) then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  if v_provider is not null and p_item_id is null then
    perform pg_advisory_xact_lock(hashtextextended(p_entity_type || ':' || v_provider || ':' || v_external_id, 0));
  end if;

  if p_entity_type = 'team' then
    if p_item_id is not null then
      update public.catalog_teams
      set name = v_name,
          country = v_country,
          provider = v_provider,
          external_id = v_external_id,
          normalization_status = 'normalized',
          updated_at = now()
      where id = p_item_id
      returning id into v_id;
    elsif v_provider is not null then
      select id into v_id
      from public.catalog_teams
      where provider = v_provider and external_id = v_external_id
      for update;

      if found then
        update public.catalog_teams
        set name = v_name,
            country = v_country,
            normalization_status = 'normalized',
            updated_at = now()
        where id = v_id;
      else
        insert into public.catalog_teams (
          provider, external_id, name, country, normalization_status, created_by
        ) values (
          v_provider, v_external_id, v_name, v_country, 'normalized', p_actor_user_id
        ) returning id into v_id;
        v_created := true;
      end if;
    else
      insert into public.catalog_teams (
        name, country, normalization_status, created_by
      ) values (
        v_name, v_country, 'normalized', p_actor_user_id
      ) returning id into v_id;
      v_created := true;
    end if;
  else
    if p_item_id is not null then
      update public.catalog_competitions
      set name = v_name,
          sport = v_sport,
          country = v_country,
          provider = v_provider,
          external_id = v_external_id,
          normalization_status = 'normalized',
          updated_at = now()
      where id = p_item_id
      returning id into v_id;
    elsif v_provider is not null then
      select id into v_id
      from public.catalog_competitions
      where provider = v_provider and external_id = v_external_id
      for update;

      if found then
        update public.catalog_competitions
        set name = v_name,
            sport = v_sport,
            country = v_country,
            normalization_status = 'normalized',
            updated_at = now()
        where id = v_id;
      else
        insert into public.catalog_competitions (
          provider, external_id, name, sport, country, normalization_status, created_by
        ) values (
          v_provider, v_external_id, v_name, v_sport, v_country, 'normalized', p_actor_user_id
        ) returning id into v_id;
        v_created := true;
      end if;
    else
      insert into public.catalog_competitions (
        name, sport, country, normalization_status, created_by
      ) values (
        v_name, v_sport, v_country, 'normalized', p_actor_user_id
      ) returning id into v_id;
      v_created := true;
    end if;
  end if;

  if v_id is null then
    raise exception 'CATALOG_ITEM_NOT_FOUND' using errcode = 'P0002';
  end if;

  insert into public.audit_logs (entity_type, entity_id, action, actor_id)
  values ('catalog', v_id, case when v_created then 'created' else 'updated' end, p_actor_user_id);

  return jsonb_build_object(
    'success', true,
    'created', v_created,
    'item', jsonb_build_object(
      'id', v_id,
      'type', p_entity_type,
      'name', v_name,
      'country', v_country,
      'sport', v_sport,
      'provider', v_provider,
      'externalId', v_external_id,
      'normalizationStatus', 'normalized',
      'isNormalized', true
    )
  );
end;
$$;
