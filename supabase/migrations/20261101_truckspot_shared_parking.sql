-- TruckSpot Europe: shared parking submissions, approval-first.
-- Run in the Supabase SQL editor; this migration never inserts fake parking data.
-- Drivers authenticate anonymously with Supabase Auth, then submit pending rows.
-- Only approved rows become publicly visible. No client can self-approve.
create extension if not exists pgcrypto;

create table if not exists public.truckspot_parking_submissions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default (select auth.uid()),
  name text not null check (length(trim(name)) between 3 and 80),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  kind text not null default 'parking' check (kind in ('parking','rustplaats')),
  fee text not null default 'unknown' check (fee in ('unknown','free','paid')),
  truck_verified boolean not null default false,
  toilets boolean not null default false,
  shower boolean not null default false,
  food boolean not null default false,
  security boolean not null default false,
  notes text not null default '' check (char_length(notes) <= 220),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz null
);

create index if not exists truckspot_submissions_status_lat_lng
  on public.truckspot_parking_submissions(status,lat,lng);
create index if not exists truckspot_submissions_owner_created
  on public.truckspot_parking_submissions(owner_id,created_at desc);

alter table public.truckspot_parking_submissions enable row level security;

-- Preserve least privilege even if PostgreSQL default privileges change.
revoke all on public.truckspot_parking_submissions from public, anon, authenticated;
grant select on public.truckspot_parking_submissions to anon, authenticated;
-- Author/approval fields deliberately omitted from INSERT grants.
grant insert(name,lat,lng,kind,fee,truck_verified,toilets,shower,food,security,notes)
  on public.truckspot_parking_submissions to authenticated;

drop policy if exists "TruckSpot everyone reads only approved parking" on public.truckspot_parking_submissions;
create policy "TruckSpot everyone reads only approved parking"
  on public.truckspot_parking_submissions
  for select to anon,authenticated
  using (status = 'approved');

drop policy if exists "TruckSpot signed-in drivers submit pending only" on public.truckspot_parking_submissions;
create policy "TruckSpot signed-in drivers submit pending only"
  on public.truckspot_parking_submissions
  for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and status = 'pending'
  );

-- Server-side flood limit: 5 submissions per authenticated user per 24 h.
-- Also enable Supabase Anonymous Sign-ins CAPTCHA/IP limits in dashboard:
-- a malicious actor can otherwise create more anonymous users.
create or replace function public.truckspot_submission_guard()
returns trigger language plpgsql security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null or new.owner_id is distinct from auth.uid() then
    raise exception 'Sign-in required';
  end if;
  if (select count(*) from public.truckspot_parking_submissions
      where owner_id=auth.uid() and created_at > now()-interval '24 hours') >= 5 then
    raise exception 'Daily submission limit reached (5 per 24 hours)';
  end if;
  if exists (
    select 1 from public.truckspot_parking_submissions
    where owner_id=auth.uid()
      and abs(lat-new.lat)<0.0002 and abs(lng-new.lng)<0.0002
      and lower(name)=lower(new.name)
  ) then
    raise exception 'This parking location was already submitted';
  end if;
  return new;
end;
$$;
revoke all on function public.truckspot_submission_guard() from public,anon,authenticated;
drop trigger if exists truckspot_submission_guard_trigger on public.truckspot_parking_submissions;
create trigger truckspot_submission_guard_trigger
  before insert on public.truckspot_parking_submissions
  for each row execute function public.truckspot_submission_guard();

-- Test in SQL Editor (admin only):
-- select id,name,lat,lng,status,created_at from public.truckspot_parking_submissions where status='pending' order by created_at desc;
-- update public.truckspot_parking_submissions set status='approved',reviewed_at=now() where id='A-REVIEWED-UUID';
-- update public.truckspot_parking_submissions set status='rejected',reviewed_at=now() where id='A-REJECTED-UUID';
-- Never put a service_role/secret key inside Android or GitHub source.
