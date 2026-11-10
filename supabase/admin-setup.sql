-- Admin dashboard setup for Salim Travel And Comfy AirBnB
-- Run this once in Supabase SQL Editor after the base schema.sql.

-- 1) Add the fields used by the admin and customer pages.
alter table public.travel_routes
  add column if not exists price_kes numeric(12,2) not null default 0,
  add column if not exists max_group_size integer not null default 7;

alter table public.rooms
  add column if not exists price_per_night_kes numeric(12,2) not null default 0,
  add column if not exists image_url text;

-- 2) Store uploaded public photos/videos.
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  file_path text not null unique,
  media_type text not null check (media_type in ('image','video')),
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.media_assets enable row level security;

-- 3) Create a profile automatically for every new Supabase Auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone',
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Backfill profiles for accounts that already existed before the trigger.
insert into public.profiles (id, full_name, phone, role)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', ''),
  u.raw_user_meta_data ->> 'phone',
  'customer'
from auth.users u
on conflict (id) do nothing;

-- Customers may edit only their own contact details, never their role.
revoke update on public.profiles from authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- Seed the confirmed Nairobi-to-Kisii fare: KES 11,000 total for up to 7 people.
-- Other county fares remain unpublished until the administrator adds them.
insert into public.travel_routes (origin, destination, description, price_kes, max_group_size)
select 'Nairobi', 'Kisii', 'Family Trip Package', 11000, 7
where not exists (
  select 1 from public.travel_routes
  where lower(origin) = 'nairobi' and lower(destination) = 'kisii'
);

-- 4) Secure helper for administrator-only database and Storage policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Admins can manage routes and prices; visitors can only read active routes.
drop policy if exists "admin manage routes" on public.travel_routes;
create policy "admin manage routes" on public.travel_routes
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin manage departures" on public.travel_departures;
create policy "admin manage departures" on public.travel_departures
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin manage guest houses" on public.guest_houses;
create policy "admin manage guest houses" on public.guest_houses
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin manage rooms" on public.rooms;
create policy "admin manage rooms" on public.rooms
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin read all bookings" on public.bookings;
create policy "admin read all bookings" on public.bookings
for select to authenticated using (public.is_admin());

drop policy if exists "admin update bookings" on public.bookings;
create policy "admin update bookings" on public.bookings
for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read published media" on public.media_assets;
create policy "public read published media" on public.media_assets
for select to anon, authenticated using (is_public = true);

drop policy if exists "admin manage media records" on public.media_assets;
create policy "admin manage media records" on public.media_assets
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 5) Create a public bucket with a 100 MB per-file limit.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  104857600,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public read site media" on storage.objects;
create policy "public read site media" on storage.objects
for select to anon, authenticated using (bucket_id = 'site-media');

drop policy if exists "admin upload site media" on storage.objects;
create policy "admin upload site media" on storage.objects
for insert to authenticated with check (
  bucket_id = 'site-media' and public.is_admin()
);

drop policy if exists "admin update site media" on storage.objects;
create policy "admin update site media" on storage.objects
for update to authenticated using (
  bucket_id = 'site-media' and public.is_admin()
) with check (
  bucket_id = 'site-media' and public.is_admin()
);

drop policy if exists "admin delete site media" on storage.objects;
create policy "admin delete site media" on storage.objects
for delete to authenticated using (
  bucket_id = 'site-media' and public.is_admin()
);

-- 6) IMPORTANT: after registering your own account on the website, promote
-- only your own account to admin by replacing the email below and running:
-- update public.profiles
-- set role = 'admin'
-- where id = (select id from auth.users where email = 'YOUR-LOGIN-EMAIL');
--
-- Never let users choose their own role during sign-up. Do not expose the
-- Supabase service-role key in website/browser environment variables.
