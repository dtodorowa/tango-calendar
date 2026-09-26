-- Organizer logos and event photos. Files live in the public `media` bucket under
-- `<org_id>/...`; the server re-encodes every upload to webp (EXIF stripped), so the
-- bucket only ever holds webp. Columns store the storage key without the size
-- suffix; see src/lib/media.ts for the variants.

alter table organizations
  add column logo text check (logo is null or logo ~ '^[0-9a-f-]{36}/logo/[0-9a-f-]{36}$');

-- hero_photo existed since 0002 but was never written; pin it to the same key shape.
alter table events
  add constraint events_hero_photo_key
    check (hero_photo is null or hero_photo ~ '^[0-9a-f-]{36}/events/[0-9a-f-]{36}$');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 2 * 1024 * 1024, array['image/webp'])
on conflict (id) do nothing;

-- The first path segment is the owning org. The regex guard keeps a malformed
-- name from failing the uuid cast instead of simply being denied.
create or replace function public.can_write_media(object_name text)
returns boolean
language sql stable as $$
  select (storage.foldername(object_name))[1] ~ '^[0-9a-f-]{36}$'
    and public.is_org_member(((storage.foldername(object_name))[1])::uuid);
$$;

-- Reads go through the public URL; members still need select to replace or remove.
create policy media_select on storage.objects for select to authenticated
  using (bucket_id = 'media' and public.can_write_media(name));
create policy media_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.can_write_media(name));
create policy media_delete on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.can_write_media(name));
