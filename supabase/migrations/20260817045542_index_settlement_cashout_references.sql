create index settlement_idempotencies_bet_id_idx
  on public.settlement_idempotencies (bet_id);
create index cashout_idempotencies_bet_id_idx
  on public.cashout_idempotencies (bet_id);
