# Supabase

The app runs on demo fixtures until `PUBLIC_SUPABASE_URL` and
`PUBLIC_SUPABASE_ANON_KEY` are set. With them set, the public pages read from the
database and organizers can sign in at `/login`.

## Local development

Needs Docker.

```sh
pnpm db:start     # first run downloads the images (a few GB)
```

The start output prints the API URL and the publishable key. Put them in `.env`:

```sh
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

Then `pnpm dev`. Sign-in emails don't leave your machine: open Mailpit at
http://127.0.0.1:54324 to read the 6-digit code.

| Command             | What it does                                                  |
| ------------------- | ------------------------------------------------------------- |
| `pnpm db:reset`     | Recreate the database: all migrations, then `seed.sql`.       |
| `pnpm db:types`     | Regenerate `src/lib/database.types.ts` after a schema change. |
| `pnpm db:seed-file` | Rewrite `seed.sql` from `src/lib/fixtures.ts`.                |
| `pnpm db:stop`      | Stop the containers.                                          |
| Studio              | http://127.0.0.1:54323, a table editor and SQL console.       |

## Schema

- `0001_spike.sql`: tables, membership helpers and RLS from the spike (ADR-0003).
- `0002_tango_calendar.sql`: the tango model (categories, tags, structured price,
  wall-clock start + timezone, organizer contact, per-locale note) and
  `create_organization()`, which creates an organizer and makes the caller its
  owner. Direct inserts into `organizations` are closed.
- `0003_save_event.sql`: `save_event()`, which writes an event and its
  translations in one transaction under the caller's RLS.

Every write from the app goes through the anon key and RLS. The service-role key
is not used anywhere in `src/`.

## Production project

1. Create a project in **EU (Frankfurt)**.
2. Push the schema: `pnpm supabase link --project-ref <ref>` then
   `pnpm supabase db push`. Don't load `seed.sql` there; it's demo data.
3. **Authentication → URL configuration:** set the site URL to the production
   domain.
4. **Authentication → Emails:** paste `templates/otp.html` into both the "Magic
   link" and "Confirm signup" templates. The stock templates send a link; ours
   sends the `{{ .Token }}` code the login form asks for.
5. **Authentication → SMTP:** configure a real mail provider (an EU one, see
   AGENTS.md > Privacy). Supabase's built-in sender is rate-limited to a handful of
   emails an hour.
6. Set `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` in Vercel.
