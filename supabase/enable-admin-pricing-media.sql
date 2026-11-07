-- Add pricing, secure admin management, and public media storage.
-- Run after supabase/schema.sql in the Supabase SQL Editor.

alter table public.travel_routes
  add column if not exists price_kes numeric(12,2) not null default 0 check (price_kes >= 0),
  add column if not exists max_group_size integer not null default 7 check (max_group_size between 1 and 7);

alter table public.rooms
  add column if not exists price_per_night_kes numeric(12,2) not null default 0 check (price_per_night_kes >= 0),
  add column if not exists image_url text;

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  file_path text not null,
  media_type text not null check (media_type in ('image','video')),
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Prevent a customer from promoting their own profile to admin.
drop policy if exists "profile update own" on public.profiles;
create policy "profile update own without role change" on public.profiles
for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id and role = 'customer');

-- Admin-only management of routes, departures, guest houses and rooms.
drop policy if exists "Admins manage routes" on public.travel_routes;
create policy "Admins manage routes" on public.travel_routes
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage departures" on public.travel_departures;
create policy "Admins manage departures" on public.travel_departures
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage guest houses" on public.guest_houses;
create policy "Admins manage guest houses" on public.guest_houses
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage rooms" on public.rooms;
create policy "Admins manage rooms" on public.rooms
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage all bookings" on public.bookings;
create policy "Admins manage all bookings" on public.bookings
for all to authenticated using (public.is_admin()) with check (public.is_admin());

alter table public.media_assets enable row level security;
drop policy if exists "Public read published media" on public.media_assets;
create policy "Public read published media" on public.media_assets
for select to anon, authenticated using (is_public or public.is_admin());
drop policy if exists "Admins manage media metadata" on public.media_assets;
create policy "Admins manage media metadata" on public.media_assets
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- The owner can publish the supplied confirmed fare. No other county fares are invented.
insert into public.travel_routes (origin, destination, description, active, price_kes, max_group_size)
values ('Nairobi', 'Kisii', 'Family Trip Package: KES 11,000 total for up to 7 people', true, 11000, 7)
on conflict do nothing;

-- Public read access to files; only admins can upload, update or delete.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 104857600,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public = true, file_size_limit = 104857600,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view site media" on storage.objects;
create policy "Public can view site media" on storage.objects
for select to anon, authenticated using (bucket_id = 'site-media');

drop policy if exists "Admins upload site media" on storage.objects;
create policy "Admins upload site media" on storage.objects
for insert to authenticated with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "Admins update site media" on storage.objects;
create policy "Admins update site media" on storage.objects
for update to authenticated using (bucket_id = 'site-media' and public.is_admin())
with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "Admins delete site media" on storage.objects;
create policy "Admins delete site media" on storage.objects
for delete to authenticated using (bucket_id = 'site-media' and public.is_admin());

-- After the owner registers on the website, run this with their auth.users UUID:
-- update public.profiles set role = 'admin' where id = 'PASTE_AUTH_USER_UUID_HERE';
