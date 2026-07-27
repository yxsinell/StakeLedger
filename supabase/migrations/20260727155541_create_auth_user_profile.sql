-- Create the application profile in the same transaction as Supabase Auth signup.
create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is null then
    raise exception 'Email is required for StakeLedger users';
  end if;

  insert into public.users (id, email, role)
  values (new.id, lower(new.email), 'user');

  return new;
end;
$$;

revoke all on function public.handle_new_auth_user() from public;
revoke execute on function public.handle_new_auth_user() from anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();
