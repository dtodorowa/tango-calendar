-- Wann-der spike schema + Row-Level Security + seed.
-- Proves ADR-0003: Organization/Team ownership with RLS isolation.
-- Apply in the Supabase SQL editor (or `supabase db push`). Then follow
-- supabase/README.md to create two test users and run the isolation checks.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table organizations (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  default_category text not null default 'other',
  created_at       timestamptz not null default now()
);

create table memberships (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  org_id     uuid not null references organizations (id) on delete cascade,
  role       text not null check (role in ('owner', 'editor')),
  created_at timestamptz not null default now(),
  unique (user_id, org_id)
);

create table venues (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations (id) on delete cascade,
  name       text not null,
  address    text not null,
  lat        double precision not null,
  lng        double precision not null,
  city       text not null,
  admin_area text not null default '',
  country    text not null default '',
  created_at timestamptz not null default now()
);
-- Note: lat/lng as plain columns for the spike. PostGIS geography + radius
-- queries come when we actually need "near me" (see ADR-0002).

create table events (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references organizations (id) on delete cascade,
  venue_id         uuid not null references venues (id) on delete restrict,
  category         text not null,
  status           text not null default 'draft' check (status in ('draft', 'published')),
  rrule            text not null,                 -- iCal RRULE body, e.g. 'FREQ=WEEKLY'
  dtstart          timestamptz not null,
  duration_minutes integer not null check (duration_minutes > 0),
  source_lang      text not null default 'de',
  created_at       timestamptz not null default now()
);

create table event_i18n (
  event_id       uuid not null references events (id) on delete cascade,
  locale         text not null check (locale in ('de', 'en', 'fr')),
  title          text not null,
  description    text not null default '',
  source_hash    text not null default '',
  is_human_edited boolean not null default false,
  primary key (event_id, locale)
);

create table occurrence_overrides (
  id                uuid primary key default gen_random_uuid(),
  event_id          uuid not null references events (id) on delete cascade,
  occ_date          date not null,                -- UTC date key of the occurrence
  status            text not null check (status in ('cancelled', 'moved')),
  override_start    timestamptz,
  override_venue_id uuid references venues (id) on delete set null,
  unique (event_id, occ_date)
);

-- ---------------------------------------------------------------------------
-- Membership helpers (SECURITY DEFINER to avoid RLS recursion on memberships)
-- ---------------------------------------------------------------------------

create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from memberships m
    where m.org_id = target_org and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_org_owner(target_org uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from memberships m
    where m.org_id = target_org and m.user_id = auth.uid() and m.role = 'owner'
  );
$$;

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------

alter table organizations       enable row level security;
alter table memberships          enable row level security;
alter table venues               enable row level security;
alter table events               enable row level security;
alter table event_i18n           enable row level security;
alter table occurrence_overrides enable row level security;

-- Organizations: public to read; only owners mutate. Any authenticated user may
-- create one (they bootstrap their owner membership via the service role / a flow).
create policy org_select on organizations for select using (true);
create policy org_insert on organizations for insert to authenticated with check (true);
create policy org_update on organizations for update using (is_org_owner(id)) with check (is_org_owner(id));
create policy org_delete on organizations for delete using (is_org_owner(id));

-- Memberships: you see your own rows (and owners see their org's); owners manage them.
create policy mem_select on memberships for select using (user_id = auth.uid() or is_org_owner(org_id));
create policy mem_insert on memberships for insert with check (is_org_owner(org_id));
create policy mem_delete on memberships for delete using (is_org_owner(org_id));

-- Venues: public to read; org members mutate.
create policy venue_select on venues for select using (true);
create policy venue_insert on venues for insert with check (is_org_member(org_id));
create policy venue_update on venues for update using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy venue_delete on venues for delete using (is_org_member(org_id));

-- Events: published are world-readable; drafts only to members; members mutate.
create policy event_select on events for select using (status = 'published' or is_org_member(org_id));
create policy event_insert on events for insert with check (is_org_member(org_id));
create policy event_update on events for update using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy event_delete on events for delete using (is_org_member(org_id));

-- Event translations inherit the parent event's visibility / ownership.
create policy i18n_select on event_i18n for select using (
  exists (select 1 from events e where e.id = event_id and (e.status = 'published' or is_org_member(e.org_id)))
);
create policy i18n_write on event_i18n for all using (
  exists (select 1 from events e where e.id = event_id and is_org_member(e.org_id))
) with check (
  exists (select 1 from events e where e.id = event_id and is_org_member(e.org_id))
);

-- Overrides inherit the parent event's visibility / ownership.
create policy override_select on occurrence_overrides for select using (
  exists (select 1 from events e where e.id = event_id and (e.status = 'published' or is_org_member(e.org_id)))
);
create policy override_write on occurrence_overrides for all using (
  exists (select 1 from events e where e.id = event_id and is_org_member(e.org_id))
) with check (
  exists (select 1 from events e where e.id = event_id and is_org_member(e.org_id))
);

-- ---------------------------------------------------------------------------
-- Seed (runs as the migration owner, bypassing RLS). Fixed UUIDs so the runbook
-- queries are concrete. Memberships are NOT seeded here — they need real
-- auth.users ids; see supabase/README.md.
-- ---------------------------------------------------------------------------

insert into organizations (id, name, slug, default_category) values
  ('00000000-0000-0000-0000-0000000000a0', 'Tango Saarbrücken', 'tango-saarbruecken', 'tango'),
  ('00000000-0000-0000-0000-0000000000b0', 'Yoga Trier', 'yoga-trier', 'yoga');

insert into venues (id, org_id, name, address, lat, lng, city, admin_area, country) values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a0', 'tkRaum', 'Nauwieserstraße, 66111 Saarbrücken', 49.2372, 6.9969, 'Saarbrücken', 'Saarland', 'DE'),
  ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000b0', 'Yoga Studio Trier', 'Simeonstraße, 54290 Trier', 49.7596, 6.6439, 'Trier', 'Rheinland-Pfalz', 'DE');

insert into events (id, org_id, venue_id, category, status, rrule, dtstart, duration_minutes, source_lang) values
  ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000a0', '00000000-0000-0000-0000-0000000000a1', 'tango', 'published', 'FREQ=WEEKLY', '2026-01-06T19:00:00Z', 180, 'de'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000b0', '00000000-0000-0000-0000-0000000000b1', 'yoga', 'published', 'FREQ=WEEKLY', '2026-01-07T18:00:00Z', 90, 'de');

insert into event_i18n (event_id, locale, title, description) values
  ('00000000-0000-0000-0000-0000000000a2', 'de', 'Dienstags-Milonga', 'Wöchentliche Milonga mit DJ. Alle Level willkommen.'),
  ('00000000-0000-0000-0000-0000000000a2', 'en', 'Tuesday Milonga', 'Weekly milonga with a DJ. All levels welcome.'),
  ('00000000-0000-0000-0000-0000000000a2', 'fr', 'Milonga du mardi', 'Milonga hebdomadaire avec DJ. Tous niveaux bienvenus.'),
  ('00000000-0000-0000-0000-0000000000b2', 'de', 'Vinyasa Flow', 'Fließende Yoga-Praxis am Mittwochabend.'),
  ('00000000-0000-0000-0000-0000000000b2', 'en', 'Vinyasa Flow', 'Flowing yoga practice on Wednesday evenings.'),
  ('00000000-0000-0000-0000-0000000000b2', 'fr', 'Vinyasa Flow', 'Pratique de yoga fluide le mercredi soir.');

insert into occurrence_overrides (event_id, occ_date, status) values
  ('00000000-0000-0000-0000-0000000000a2', '2026-01-20', 'cancelled');
