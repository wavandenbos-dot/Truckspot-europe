-- TruckSpot Europe v1.0.5: manual review, no automated approvals.
-- IMPORTANT: authorize only a NON-anonymous Supabase Auth email/password
-- account by setting its trusted raw_app_meta_data.truckspot_moderator = true.
-- app_metadata cannot be written by normal clients.
grant update (status) on public.truckspot_parking_corrections to authenticated;
grant update (status,overnight_verified,overnight_source)
 on public.truckspot_parking_submissions to authenticated;
grant select (overnight_claimed) on public.truckspot_parking_submissions to authenticated;

drop policy if exists "truckspot moderator sees corrections awaiting review" on public.truckspot_parking_corrections;
create policy "truckspot moderator sees corrections awaiting review"
 on public.truckspot_parking_corrections for select to authenticated
 using (
  ((select auth.jwt())->'app_metadata'->>'truckspot_moderator') = 'true'
  and coalesce(((select auth.jwt())->>'is_anonymous')::boolean,true) = false
 );

drop policy if exists "truckspot moderator reviews pending corrections" on public.truckspot_parking_corrections;
create policy "truckspot moderator reviews pending corrections"
 on public.truckspot_parking_corrections for update to authenticated
 using (
  status='pending'
  and ((select auth.jwt())->'app_metadata'->>'truckspot_moderator') = 'true'
  and coalesce(((select auth.jwt())->>'is_anonymous')::boolean,true) = false
 )
 with check (
  status in ('approved','rejected')
  and ((select auth.jwt())->'app_metadata'->>'truckspot_moderator') = 'true'
  and coalesce(((select auth.jwt())->>'is_anonymous')::boolean,true) = false
 );

drop policy if exists "truckspot moderator sees parking awaiting review" on public.truckspot_parking_submissions;
create policy "truckspot moderator sees parking awaiting review"
 on public.truckspot_parking_submissions for select to authenticated
 using (
  ((select auth.jwt())->'app_metadata'->>'truckspot_moderator') = 'true'
  and coalesce(((select auth.jwt())->>'is_anonymous')::boolean,true) = false
 );

drop policy if exists "truckspot moderator reviews pending parking" on public.truckspot_parking_submissions;
create policy "truckspot moderator reviews pending parking"
 on public.truckspot_parking_submissions for update to authenticated
 using (
  status='pending'
  and ((select auth.jwt())->'app_metadata'->>'truckspot_moderator') = 'true'
  and coalesce(((select auth.jwt())->>'is_anonymous')::boolean,true) = false
 )
 with check (
  status in ('approved','rejected')
  and ((select auth.jwt())->'app_metadata'->>'truckspot_moderator') = 'true'
  and coalesce(((select auth.jwt())->>'is_anonymous')::boolean,true) = false
 );

create schema if not exists truckspot_private;
revoke all on schema truckspot_private from public,anon,authenticated;
create or replace function truckspot_private.finalize_manual_review()
returns trigger language plpgsql security invoker
set search_path = pg_catalog, pg_temp
as $$
begin
 if old.status is distinct from 'pending' or new.status not in ('approved','rejected') then
  raise exception 'Only pending reports can be reviewed';
 end if;
 if tg_table_name = 'truckspot_parking_submissions' and new.status = 'approved' then
  if new.truck_verified is not true or new.overnight_claimed is not true
    or new.overnight_verified is not true
    or char_length(trim(coalesce(new.overnight_source,''))) < 12 then
   raise exception 'Approval requires independently checked truck parking and overnight source';
  end if;
 end if;
 if tg_table_name = 'truckspot_parking_submissions' and new.status = 'rejected' then
  new.overnight_verified := false;
  new.overnight_source := null;
 end if;
 new.reviewed_at := now();
 return new;
end;
$$;
revoke all on function truckspot_private.finalize_manual_review() from public,anon,authenticated;
drop trigger if exists truckspot_review_corrections_trigger on public.truckspot_parking_corrections;
create trigger truckspot_review_corrections_trigger
 before update on public.truckspot_parking_corrections
 for each row execute function truckspot_private.finalize_manual_review();
drop trigger if exists truckspot_review_submissions_trigger on public.truckspot_parking_submissions;
create trigger truckspot_review_submissions_trigger
 before update on public.truckspot_parking_submissions
 for each row execute function truckspot_private.finalize_manual_review();
-- One-time provisioning via SQL editor after verified email/password user signup:
-- UPDATE auth.users SET raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb)
--   || '{"truckspot_moderator":true}'::jsonb
-- WHERE id='<VERIFIED_AUTH_USER_UUID>';
-- Never promote anonymous drivers, and never use service role keys in the app.
