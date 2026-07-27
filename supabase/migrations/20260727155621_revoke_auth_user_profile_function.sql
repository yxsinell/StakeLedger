-- The profile trigger invokes this SECURITY DEFINER function internally.
revoke execute on function public.handle_new_auth_user() from anon, authenticated;
