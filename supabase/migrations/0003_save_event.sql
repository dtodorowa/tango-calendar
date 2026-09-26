-- Save an event and its translations in one transaction, so a failed translation
-- write can't leave an untitled event behind. SECURITY INVOKER: every statement
-- runs under the caller's RLS, so members can only touch their own org's events.

create or replace function public.save_event(p_id uuid, p_event jsonb, p_translations jsonb)
returns uuid
language plpgsql security invoker set search_path = public as $$
declare
  saved_id uuid;
begin
  if p_id is null then
    insert into events (
      org_id, venue_id, categories, tags, status, rrule, dtstart_local, timezone,
      duration_minutes, price_kind, price_amount, source_lang
    )
    values (
      (p_event ->> 'org_id')::uuid,
      (p_event ->> 'venue_id')::uuid,
      array(select jsonb_array_elements_text(p_event -> 'categories')),
      array(select jsonb_array_elements_text(p_event -> 'tags')),
      p_event ->> 'status',
      p_event ->> 'rrule',
      (p_event ->> 'dtstart_local')::timestamp,
      coalesce(p_event ->> 'timezone', 'Europe/Berlin'),
      (p_event ->> 'duration_minutes')::int,
      p_event ->> 'price_kind',
      (p_event ->> 'price_amount')::numeric,
      p_event ->> 'source_lang'
    )
    returning id into saved_id;
  else
    update events set
      org_id = (p_event ->> 'org_id')::uuid,
      venue_id = (p_event ->> 'venue_id')::uuid,
      categories = array(select jsonb_array_elements_text(p_event -> 'categories')),
      tags = array(select jsonb_array_elements_text(p_event -> 'tags')),
      status = p_event ->> 'status',
      rrule = p_event ->> 'rrule',
      dtstart_local = (p_event ->> 'dtstart_local')::timestamp,
      timezone = coalesce(p_event ->> 'timezone', 'Europe/Berlin'),
      duration_minutes = (p_event ->> 'duration_minutes')::int,
      price_kind = p_event ->> 'price_kind',
      price_amount = (p_event ->> 'price_amount')::numeric,
      source_lang = p_event ->> 'source_lang'
    where id = p_id
    returning id into saved_id;

    -- RLS hides other orgs' rows, so "not found" also covers "not yours".
    if saved_id is null then
      raise exception 'event not found' using errcode = 'P0002';
    end if;
  end if;

  delete from event_i18n where event_id = saved_id;
  insert into event_i18n (event_id, locale, title, description, note)
  select
    saved_id,
    translation ->> 'locale',
    translation ->> 'title',
    coalesce(translation ->> 'description', ''),
    coalesce(translation ->> 'note', '')
  from jsonb_array_elements(p_translations) as translation;

  return saved_id;
end;
$$;

revoke execute on function public.save_event(uuid, jsonb, jsonb) from public, anon;
grant execute on function public.save_event(uuid, jsonb, jsonb) to authenticated;
