-- Encuentros and marathons: multi-day or all-night dancing, distinct from a
-- festival with a show and classes. Asked for in discussion #21.

alter table events
  drop constraint events_categories_check,
  add constraint events_categories_check
    check (cardinality(categories) >= 1
      and categories <@ array['milonga', 'practica', 'workshop', 'festival', 'show', 'cafe', 'hangout', 'encuentro']);
