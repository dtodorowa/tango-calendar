-- Organizers list their social profiles (Instagram, Facebook, WhatsApp channel, ...)
-- next to email, phone and website. Stored as plain URLs; the UI infers the
-- platform from the host, so a new network needs no schema change.

-- Check constraints can't hold subqueries, so the per-element rule lives in an
-- immutable helper.
create or replace function public.are_http_urls(urls text[])
returns boolean
language sql immutable as $$
  select coalesce(bool_and(url ~ '^https?://\S+$' and length(url) <= 300), true)
  from unnest(urls) as url;
$$;

alter table organizations
  add column social_links text[] not null default '{}'
    check (cardinality(social_links) <= 6 and public.are_http_urls(social_links));

drop function public.create_organization(text, text, text, text, text);

create function public.create_organization(
  p_name text,
  p_slug text,
  p_email text default null,
  p_phone text default null,
  p_website text default null,
  p_social_links text[] default '{}'
)
returns organizations
language plpgsql security definer set search_path = public as $$
declare
  created organizations;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  insert into organizations (name, slug, email, phone, website, social_links)
  values (p_name, p_slug, p_email, p_phone, p_website, coalesce(p_social_links, '{}'))
  returning * into created;

  insert into memberships (user_id, org_id, role)
  values (auth.uid(), created.id, 'owner');

  return created;
end;
$$;

revoke execute on function public.create_organization(text, text, text, text, text, text[])
  from public, anon;
grant execute on function public.create_organization(text, text, text, text, text, text[])
  to authenticated;
