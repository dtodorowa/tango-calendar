-- Removes the demo data that seed.sql loads, and nothing else. Rows are matched on
-- seed.sql's deterministic ids, so organizers created through the app are untouched.
--
--   pnpm supabase db query --linked -f supabase/demo-cleanup.sql
--
-- One statement on purpose: `db query --local` rejects multi-statement files, and a
-- single statement is atomic without begin/commit. events.venue_id is
-- `on delete restrict`, so events are deleted explicitly rather than left to the
-- org cascade.

with demo_orgs (id) as (
  values
    (md5('org-tango-saar')::uuid),
    (md5('org-tango-lux')::uuid),
    (md5('org-tango-trier')::uuid),
    (md5('org-metz')::uuid),
    (md5('org-forbach')::uuid),
    (md5('org-homburg')::uuid)
),
deleted_events as (
  delete from events where org_id in (select id from demo_orgs) returning id
),
deleted_venues as (
  delete from venues where org_id in (select id from demo_orgs) returning id
),
deleted_orgs as (
  delete from organizations where id in (select id from demo_orgs) returning id
)
select
  (select count(*) from deleted_orgs) as organizations,
  (select count(*) from deleted_venues) as venues,
  (select count(*) from deleted_events) as events;
