create function public.upsert_catalog_item_with_alias(
  p_actor_user_id uuid,
  p_entity_type text,
  p_item_id uuid,
  p_name text,
  p_sport text default null,
  p_country text default null,
  p_provider text default null,
  p_external_id text default null,
  p_alias text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
  v_alias text := nullif(btrim(p_alias), '');
begin
  if char_length(v_alias) > 100 then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  v_result := public.upsert_catalog_item(
    p_actor_user_id,
    p_entity_type,
    p_item_id,
    p_name,
    p_sport,
    p_country,
    p_provider,
    p_external_id
  );

  if v_alias is not null then
    perform public.create_catalog_alias(
      p_actor_user_id,
      p_entity_type,
      ((v_result -> 'item' ->> 'id')::uuid),
      v_alias
    );
  end if;

  return v_result;
end;
$$;

revoke all on function public.upsert_catalog_item_with_alias(
  uuid, text, uuid, text, text, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.upsert_catalog_item_with_alias(
  uuid, text, uuid, text, text, text, text, text, text
) to service_role;
