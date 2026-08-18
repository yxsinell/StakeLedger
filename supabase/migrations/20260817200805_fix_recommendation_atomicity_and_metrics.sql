-- Keep partial updates and follow snapshots atomic, and include every settled bet in operational metrics.

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
  v_created boolean := false;
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
  else
    v_created := true;
    insert into public.audit_logs (entity_type, entity_id, action, actor_id)
    values ('recommendation', p_recommendation_id, 'followed', p_actor_user_id);
  end if;

  return pg_catalog.jsonb_build_object(
    'followId', v_follow.id,
    'created', v_created,
    'createdAt', v_follow.created_at,
    'recommendationId', v_recommendation.id,
    'bankId', v_follow.bank_id,
    'prefill', pg_catalog.jsonb_build_object(
      'recommendationId', v_recommendation.id,
      'bankId', v_follow.bank_id,
      'odds', v_recommendation.odds,
      'legs', pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object(
        'referenceType', 'normalized',
        'eventId', v_recommendation.event_id,
        'marketId', v_recommendation.market_id,
        'selection', v_recommendation.selection,
        'odds', v_recommendation.odds
      ))
    )
  );
end;
$$;

revoke all on function public.follow_recommendation(uuid, uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.follow_recommendation(uuid, uuid, uuid)
  to service_role;

create or replace view public.settled_bet_metric_trace
with (security_invoker = true)
as
select
  bet.id as bet_id,
  bet.bank_id,
  bank.user_id as bank_owner_user_id,
  bank.currency,
  bet.settled_at,
  bet.result,
  bet.odds,
  bet.stake_amount as total_stake,
  funding.cash_stake,
  case bet.result
    when 'won' then funding.cash_stake * (bet.odds - 1)
    when 'lost' then -funding.cash_stake
    when 'void' then 0::numeric
    when 'half_won' then funding.cash_stake * (bet.odds - 1) / 2
    when 'half_lost' then -funding.cash_stake / 2
  end as cash_component_profit,
  bet.profit_amount as total_profit
from public.bets as bet
join public.banks as bank on bank.id = bet.bank_id
join lateral (
  select coalesce(pg_catalog.sum(bet_funding.amount) filter (
    where bet_funding.pocket_type = 'cash'
  ), 0::numeric) as cash_stake
  from public.bet_funding
  where bet_funding.bet_id = bet.id
) as funding on true
where bet.status = 'settled'
  and bet.settled_at is not null
  and bet.profit_amount is not null
  and bet.result in ('won', 'lost', 'void', 'half_won', 'half_lost');

revoke all on table public.settled_bet_metric_trace from public, anon, authenticated;
grant select on table public.settled_bet_metric_trace to service_role;

comment on view public.settled_bet_metric_trace is
  'Metrics source: every settled bet contributes operational results; verified cash funding contributes cash results.';
