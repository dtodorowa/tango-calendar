-- SaarLorLux+ Tango Calendar schema, evolving the spike (0001).
-- Matches src/lib/types.ts: multiple categories + tags per event, structured
-- price, wall-clock start in a named timezone, organizer contact details, and a
-- short per-locale note. RLS changes ship in the same migration (AGENTS.md).

-- ---------------------------------------------------------------------------
-- Drop the spike seed (tango + yoga placeholder rows). Demo data now lives in
-- supabase/seed.sql, generated from src/lib/fixtures.ts.
-- ---------------------------------------------------------------------------

delete from events where org_id in (
  '00000000-0000-0000-0000-0000000000a0', '00000000-0000-0000-0000-0000000000b0'
);
delete from organizations where id in (
  '00000000-0000-0000-0000-0000000000a0', '00000000-0000-0000-0000-0000000000b0'
);

-- ---------------------------------------------------------------------------
-- Organizations: public contact details (shown by the organizer's choice)
-- ---------------------------------------------------------------------------

alter table organizations
  drop column default_category,
  add column email   text check (email is null or email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  add column phone   text check (phone is null or length(phone) <= 40),
  add column website text check (website is null or website ~ '^https?://'),
  add constraint organizations_slug_format check (slug ~ '^[a-z0-9-]{1,64}$'),
  add constraint organizations_name_length check (length(name) between 1 and 120);

-- ---------------------------------------------------------------------------
-- Venues
-- ---------------------------------------------------------------------------

alter table venues
  drop column admin_area,
  add constraint venues_lat check (lat between -90 and 90),
  add constraint venues_lng check (lng between -180 and 180);

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------

alter table events
  drop column category,
  drop column dtstart,
  add column categories text[] not null
    check (cardinality(categories) >= 1
      and categories <@ array['milonga', 'practica', 'workshop', 'festival', 'show', 'cafe']),
  add column tags text[] not null default '{}'
    check (tags <@ array['open-air', 'beginner-friendly', 'live-music', 'with-workshop']),
  -- Wall-clock start in `timezone` so a 20:30 milonga stays 20:30 across DST.
  add column dtstart_local timestamp not null,
  add column timezone text not null default 'Europe/Berlin',
  add column price_kind text not null default 'fixed'
    check (price_kind in ('fixed', 'donation', 'free')),
  add column price_amount numeric(6, 2)
    check (price_amount is null or price_amount >= 0),
  add column hero_photo text,
  add column updated_at timestamptz not null default now(),
  add constraint events_price_amount_required
    check (price_kind <> 'fixed' or price_amount is not null),
  add constraint events_source_lang check (source_lang in ('de', 'en', 'fr')),
  add constraint events_rrule_length check (length(rrule) between 1 and 500);

create index events_org_id_idx on events (org_id);
create index events_venue_id_idx on events (venue_id);
create index venues_org_id_idx on venues (org_id);

alter table event_i18n
  add column note text not null default '' check (length(note) <= 120),
  add constraint event_i18n_title_length check (length(title) between 1 and 160),
  add constraint event_i18n_description_length check (length(description) <= 4000);

-- ---------------------------------------------------------------------------
-- Occurrence overrides: dates are local (series timezone), moves are wall time
-- ---------------------------------------------------------------------------

alter table occurrence_overrides
  drop column override_start,
  add column override_start_local timestamp,
  add constraint overrides_moved_needs_start
    check (status <> 'moved' or override_start_local is not null);
comment on column occurrence_overrides.occ_date is
  'Local date (in the series timezone) of the occurrence being overridden';

-- ---------------------------------------------------------------------------
-- Creating an organizer: one call makes the org and the caller its owner.
-- Direct inserts are closed so nobody ends up with an org they can't manage.
-- ---------------------------------------------------------------------------

drop policy org_insert on organizations;

create or replace function public.create_organization(
  p_name text,
  p_slug text,
  p_email text default null,
  p_phone text default null,
  p_website text default null
)
returns organizations
language plpgsql security definer set search_path = public as $$
declare
  created organizations;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  insert into organizations (name, slug, email, phone, website)
  values (p_name, p_slug, p_email, p_phone, p_website)
  returning * into created;

  insert into memberships (user_id, org_id, role)
  values (auth.uid(), created.id, 'owner');

  return created;
end;
$$;

revoke execute on function public.create_organization(text, text, text, text, text)
  from public, anon;
grant execute on function public.create_organization(text, text, text, text, text)
  to authenticated;

-- Members (not only owners) keep their organizer profile up to date.
drop policy org_update on organizations;
create policy org_update on organizations for update
  using (is_org_member(id)) with check (is_org_member(id));

-- Keep updated_at honest for "recently changed" views later.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_touch_updated_at
  before update on events
  for each row execute function public.touch_updated_at();
