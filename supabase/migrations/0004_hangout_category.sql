-- Casual community hangouts: low-key get-togethers that aren't a class or a milonga.

alter table events
  drop constraint events_categories_check,
  add constraint events_categories_check
    check (cardinality(categories) >= 1
      and categories <@ array['milonga', 'practica', 'workshop', 'festival', 'show', 'cafe', 'hangout']);
