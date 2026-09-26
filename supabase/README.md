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
- `0004_hangout_category.sql`: adds the `hangout` category.

Every write from the app goes through the anon key and RLS. The service-role key
is not used anywhere in `src/`.

## Production project

1. Create a project in an EU region. Production runs in `eu-west-1` (Ireland);
   keep the Vercel function region in `vite.config.ts` next to it.
2. Push the schema: `pnpm supabase link --project-ref <ref>` then
   `pnpm supabase db push`. Don't load `seed.sql` there; it's demo data. If you
   loaded it for a demo, `pnpm supabase db query --linked -f supabase/demo-cleanup.sql`
   removes exactly those rows and leaves real organizers alone.
3. **Authentication → URL configuration:** set the site URL to the production
   domain.
4. **Authentication → Emails → SMTP Settings:** turn on custom SMTP. Supabase's
   built-in sender is rate-limited to a handful of emails an hour and keeps the
   templates locked. We use [Lettermint](https://lettermint.co) (Netherlands, so
   the mail path stays in the EU, see AGENTS.md > Privacy):
   - In Lettermint, create a project and add a sending domain you control. A
     `*.vercel.app` address won't work: you can't edit its DNS, and Vercel's
     DMARC policy rejects mail sent in its name. Add the DNS records Lettermint
     shows and wait for it to verify.
   - Create a token under Projects → your project → API Tokens.
   - In Supabase: host `smtp.lettermint.co`, port `587`, username `lettermint`,
     password the project token, sender `login@<your domain>`, sender name
     `SaarLorLux+ Tango Calendar`.
5. **Authentication → Emails → Templates:** paste `templates/sign-in.html` into both
   the "Magic link" and "Confirm signup" templates, with the subject
   `Dein Anmeldelink / Your sign-in link / Ton lien de connexion` on both. The
   email's button links to `{{ .SiteURL }}/auth/confirm`, so the site URL from
   step 3 must be the production domain.
   Links from preview deployments also land on production. It picks
   de/en/fr from the `locale` the login form stores in the user's metadata, so
   the email comes in the language the person last used the site in. Accounts
   with no stored locale get all three. Re-paste it whenever the file changes.
6. Set `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` in Vercel.
