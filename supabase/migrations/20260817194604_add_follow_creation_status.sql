-- Let the BFF distinguish a newly persisted follow from an idempotent replay.

create or replace function public.follow_recommendation(
  p_actor_user_id uuid,
  p_recommendation_id uuid,
  p_bank_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_recommendation public.recommendations%rowtype;
  v_follow public.recommendation_follows%rowtype;
begin
  if p_actor_user_id is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '28000';
  end if;
  if not exists (select 1 from public.users where id = p_actor_user_id) then
    raise exception 'PROFILE_NOT_FOUND' using errcode = 'P0002';
  end if;

  perform 1 from public.banks
  where id = p_bank_id and user_id = p_actor_user_id
  for key share;
  if not found then
    raise exception 'BANK_NOT_FOUND' using errcode = 'P0002';
  end if;

  select * into v_recommendation
  from public.recommendations
  where id = p_recommendation_id
  for share;
  if not found then
    raise exception 'RECOMMENDATION_NOT_FOUND' using errcode = 'P0002';
  end if;
  if v_recommendation.status <> 'published' then
    raise exception 'RECOMMENDATION_NOT_PUBLISHED' using errcode = 'P0001';
  end if;

  perform public.assert_normalized_recommendation_reference(
    v_recommendation.event_id,
    v_recommendation.market_id
  );

  insert into public.recommendation_follows (user_id, recommendation_id, bank_id)
  values (p_actor_user_id, p_recommendation_id, p_bank_id)
  on conflict (user_id, recommendation_id) do nothing
  returning * into v_follow;

  if not found then
    select * into v_follow
    from public.recommendation_follows
    where user_id = p_actor_user_id
      and recommendation_id = p_recommendation_id
    for update;

    if v_follow.bank_id is distinct from p_bank_id then
      raise exception 'RECOMMENDATION_PREFILL_INVALID' using errcode = 'P0001';
    end if;

    return pg_catalog.jsonb_build_object('followId', v_follow.id, 'created', false);
  end if;

  insert into public.audit_logs (entity_type, entity_id, action, actor_id)
  values ('recommendation', p_recommendation_id, 'followed', p_actor_user_id);

  return pg_catalog.jsonb_build_object('followId', v_follow.id, 'created', true);
end;
$$;

revoke all on function public.follow_recommendation(uuid, uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.follow_recommendation(uuid, uuid, uuid)
  to service_role;
