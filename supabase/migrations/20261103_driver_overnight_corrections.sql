-- TruckSpot Europe 1.0.4: submissions of overnight rule corrections.
-- Approved = reviewed driver testimony, NOT an operator-confirmed overnight permission.
create table if not exists public.truckspot_parking_corrections (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid(),
 source_spot_id text not null check (char_length(source_spot_id) between 3 and 150 and source_spot_id ~ '^[A-Za-z0-9:._-]+$'),
 spot_name text not null check (char_length(trim(spot_name)) between 2 and 120),
 lat double precision not null check (lat between -90 and 90),
 lng double precision not null check (lng between -180 and 180),
 overnight text not null check (overnight in ('yes','no')),
 evidence text not null check (char_length(trim(evidence)) between 8 and 220),
 status text not null default 'pending' check (status in ('pending','approved','rejected')),
 created_at timestamptz not null default now(),
 reviewed_at timestamptz
);
create index if not exists truckspot_corrections_status_coords on public.truckspot_parking_corrections(status,lat,lng);
create index if not exists truckspot_corrections_owner_created on public.truckspot_parking_corrections(owner_id,created_at desc);
alter table public.truckspot_parking_corrections enable row level security;
revoke all on public.truckspot_parking_corrections from public, anon, authenticated;
grant select (id,source_spot_id,spot_name,lat,lng,overnight,evidence,status,created_at)
 on public.truckspot_parking_corrections to anon,authenticated;
grant insert (source_spot_id,spot_name,lat,lng,overnight,evidence)
 on public.truckspot_parking_corrections to authenticated;
drop policy if exists "truckspot approved corrections visible as driver reports" on public.truckspot_parking_corrections;
create policy "truckspot approved corrections visible as driver reports"
 on public.truckspot_parking_corrections for select to anon,authenticated
 using (status='approved');
drop policy if exists "truckspot authenticated driver corrections remain pending" on public.truckspot_parking_corrections;
create policy "truckspot authenticated driver corrections remain pending"
 on public.truckspot_parking_corrections for insert to authenticated
 with check (owner_id=(select auth.uid()) and status='pending');
create schema if not exists truckspot_private;
revoke all on schema truckspot_private from public,anon,authenticated;
create or replace function truckspot_private.truckspot_correction_guard()
returns trigger language plpgsql security definer
set search_path = pg_catalog, pg_temp
as $$
begin
 if auth.uid() is null or new.owner_id is distinct from auth.uid() then
  raise exception 'Sign-in required for corrections';
 end if;
 if (select count(*) from public.truckspot_parking_corrections
    where owner_id=auth.uid() and created_at>now()-interval '24 hours')>=5 then
  raise exception 'Daily correction submission limit reached (5 per 24 hours)';
 end if;
 if exists (select 1 from public.truckspot_parking_corrections
    where owner_id=auth.uid() and source_spot_id=new.source_spot_id and status='pending') then
  raise exception 'A correction for this spot is already awaiting review';
 end if;
 return new;
end;
$$;
revoke all on function truckspot_private.truckspot_correction_guard() from public,anon,authenticated;
drop trigger if exists truckspot_correction_guard_trigger on public.truckspot_parking_corrections;
create trigger truckspot_correction_guard_trigger before insert
 on public.truckspot_parking_corrections for each row
 execute function truckspot_private.truckspot_correction_guard();
-- Review pending reports using the Supabase SQL editor / dashboard with privileged access.
-- UPDATE public.truckspot_parking_corrections SET status='approved',reviewed_at=now() WHERE id='...';
-- The app never gets a write grant to moderation fields, nor any privileged API key.
