-- Organizers asked for more than six social links (Spotify playlists, a
-- Linktree, event pages). Keep in step with MAX_SOCIAL_LINKS in src/lib/social.ts.

alter table organizations
  drop constraint organizations_social_links_check,
  add constraint organizations_social_links_check
    check (cardinality(social_links) <= 15 and public.are_http_urls(social_links));
