-- Schema for Supabase MCP: tables, triggers, RLS policies

begin;

create extension if not exists pgcrypto;

-- profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  wechat_nickname text not null unique,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- access_grants table
create table if not exists public.access_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  granted_by uuid references public.profiles(id),
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  duration_key text not null check (duration_key in ('forever','1y','6m','3m','1m','custom'))
);

create index if not exists idx_access_grants_granted_by on public.access_grants(granted_by);

-- helper: check if current user is admin
create or replace function public.is_admin() returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- trigger: create profile on user signup
create or replace function public.handle_new_user() returns trigger
language plpgsql
security definer as $$
begin
  insert into public.profiles (id, wechat_nickname)
  values (new.id, coalesce(new.raw_user_meta_data->>'wechat_nickname',''))
  on conflict (id) do nothing;
  return new;
end;$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.access_grants enable row level security;

-- profiles policies
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select using (auth.uid() = id);

drop policy if exists profiles_select_admin on public.profiles;
create policy profiles_select_admin on public.profiles for select using (public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update using (auth.uid() = id);

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles for update using (public.is_admin());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert with check (auth.uid() = id);

drop policy if exists profiles_delete_admin on public.profiles;
create policy profiles_delete_admin on public.profiles for delete using (public.is_admin());

-- access_grants policies
drop policy if exists grants_select_own on public.access_grants;
create policy grants_select_own on public.access_grants for select using (auth.uid() = user_id);

drop policy if exists grants_select_admin on public.access_grants;
create policy grants_select_admin on public.access_grants for select using (public.is_admin());

drop policy if exists grants_modify_admin on public.access_grants;
create policy grants_modify_admin on public.access_grants for insert with check (public.is_admin());
create policy grants_update_admin on public.access_grants for update using (public.is_admin());
create policy grants_delete_admin on public.access_grants for delete using (public.is_admin());

commit;

-- Note: 创建管理员账号需要 Service Key，建议在 MCP 以安全上下文执行：
-- insert into auth.users (id, email, encrypted_password, email_confirmed_at)
--  使用官方管理 API 更安全；或在 Dashboard 手动创建 admin@yushuo.local 后，执行：
-- update public.profiles set is_admin=true where id = (select id from auth.users where email='admin@yushuo.local');


