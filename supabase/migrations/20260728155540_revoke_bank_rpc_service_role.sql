revoke all on function public.create_bank_with_pockets(text, text, numeric, numeric, numeric)
  from public, anon, service_role;
grant execute on function public.create_bank_with_pockets(text, text, numeric, numeric, numeric)
  to authenticated;
