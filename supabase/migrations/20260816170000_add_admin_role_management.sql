alter table public.users add column role_version bigint not null default 1;

alter table public.audit_logs drop constraint audit_logs_entity_type_check;
alter table public.audit_logs drop constraint audit_logs_action_check;
alter table public.audit_logs
  add constraint audit_logs_entity_type_check check (entity_type in ('bank', 'transaction', 'bet', 'goal', 'recommendation', 'catalog', 'user')),
  add constraint audit_logs_action_check check (action in ('created', 'updated', 'deleted', 'reserved', 'settled', 'cashout', 'closed', 'published', 'followed', 'unfollowed', 'role_changed'));

revoke update on table public.users from authenticated;
drop policy if exists users_update_own_or_admin on public.users;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.users where id = (select auth.uid()) and role = 'admin');
$$;

create or replace function public.is_catalog_editor()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.users where id = (select auth.uid()) and role in ('admin', 'editor'));
$$;

create function public.change_user_role(
  p_actor_user_id uuid,
  p_target_user_id uuid,
  p_role text,
  p_expected_role_version bigint
)
returns table (id uuid, email text, role text, role_version bigint, created_at timestamptz)
language plpgsql security definer set search_path = '' as $$
declare
  v_target public.users%rowtype;
begin
  if p_actor_user_id = p_target_user_id then raise exception 'SELF_ROLE_CHANGE_FORBIDDEN' using errcode = '42501'; end if;
  if p_role not in ('admin', 'editor', 'user') then raise exception 'INVALID_ROLE' using errcode = '22023'; end if;
  if not exists (select 1 from public.users where users.id = p_actor_user_id and users.role = 'admin' for key share) then raise exception 'ADMIN_REQUIRED' using errcode = '42501'; end if;
  select * into v_target from public.users where users.id = p_target_user_id for update;
  if not found then raise exception 'USER_NOT_FOUND' using errcode = 'P0002'; end if;
  if v_target.role_version <> p_expected_role_version then raise exception 'ROLE_VERSION_CONFLICT' using errcode = '40001'; end if;
  update public.users set role = p_role, role_version = role_version + 1 where users.id = p_target_user_id
    returning users.id, users.email, users.role, users.role_version, users.created_at into id, email, role, role_version, created_at;
  insert into public.audit_logs (entity_type, entity_id, action, actor_id) values ('user', p_target_user_id, 'role_changed', p_actor_user_id);
  return next;
end;
$$;

revoke all on function public.change_user_role(uuid, uuid, text, bigint) from public, anon, authenticated;
grant execute on function public.change_user_role(uuid, uuid, text, bigint) to service_role;
