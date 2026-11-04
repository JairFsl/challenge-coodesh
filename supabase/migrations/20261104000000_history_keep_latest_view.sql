-- =============================================================================
-- History: never move `viewed_at` backwards
-- =============================================================================
-- Views recorded offline are synced later and may arrive out of order (e.g. a
-- device that stayed offline uploads an older view after a newer one was saved).
-- The upsert from the app always sends the view timestamp, so on conflict we keep
-- the most recent one instead of the last one received.

create or replace function public.history_keep_latest_view()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.viewed_at := greatest(old.viewed_at, new.viewed_at);
  return new;
end;
$$;

create trigger history_keep_latest_view
  before update on public.history
  for each row
  execute function public.history_keep_latest_view();
