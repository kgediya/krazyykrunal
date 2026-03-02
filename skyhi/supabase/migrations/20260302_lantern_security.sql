-- 1) Ensure crypto helpers for token generation
create extension if not exists pgcrypto;

-- 2) Room access table (PIN + secret token)
create table if not exists public.sky_rooms (
  room_id text primary key check (room_id ~ '^\d{3,6}$'),
  access_token text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.sky_rooms enable row level security;

-- Hard deny all direct client access to room secrets.
drop policy if exists sky_rooms_no_access_anon on public.sky_rooms;
create policy sky_rooms_no_access_anon
on public.sky_rooms
for all
to anon, authenticated
using (false)
with check (false);

-- 3) Lock down lantern table: no direct anon/authenticated access.
alter table public.lanterns enable row level security;

do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='lanterns'
  loop
    execute format('drop policy if exists %I on public.lanterns', p.policyname);
  end loop;
end $$;

-- Optional explicit deny policy for clarity.
create policy lanterns_no_direct_client_access
on public.lanterns
for all
to anon, authenticated
using (false)
with check (false);

-- 4) Seed / rotate room token example (replace room_id as needed)
-- insert into public.sky_rooms(room_id, access_token, active)
-- values ('1102', encode(gen_random_bytes(24), 'hex'), true)
-- on conflict (room_id)
-- do update set access_token = excluded.access_token, active = true;

-- 5) After migration, read the token and place it in clients:
-- select room_id, access_token from public.sky_rooms where room_id = '1102';