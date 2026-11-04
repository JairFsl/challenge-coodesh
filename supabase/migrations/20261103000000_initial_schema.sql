-- =============================================================================
-- Initial schema: word list, favorites and history (per user)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- words: English word list (seeded from dwyl/english-words words_dictionary.json)
-- The word itself is the primary key, enabling keyset pagination:
--   select word from words where word > :cursor order by word limit :n
-- -----------------------------------------------------------------------------
create table public.words (
  word text primary key check (char_length(word) between 1 and 64)
);

comment on table public.words is 'English word list used by the infinite scroll (read-only for clients).';

-- -----------------------------------------------------------------------------
-- favorites: words saved as favorite by each user
-- -----------------------------------------------------------------------------
create table public.favorites (
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  word       text        not null references public.words (word) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, word)
);

create index favorites_user_id_created_at_idx on public.favorites (user_id, created_at desc);
create index favorites_word_idx on public.favorites (word);

comment on table public.favorites is 'Words favorited by each user.';

-- -----------------------------------------------------------------------------
-- history: words already viewed by each user (one row per word, last view wins)
-- Clients upsert on (user_id, word) updating viewed_at.
-- -----------------------------------------------------------------------------
create table public.history (
  user_id   uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  word      text        not null references public.words (word) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (user_id, word)
);

create index history_user_id_viewed_at_idx on public.history (user_id, viewed_at desc);
create index history_word_idx on public.history (word);

comment on table public.history is 'Words viewed by each user, ordered by the most recent view.';

-- -----------------------------------------------------------------------------
-- Privileges: the project default ACL grants everything to anon/authenticated,
-- so revoke it and grant only what each table needs.
-- -----------------------------------------------------------------------------
revoke all on public.words, public.favorites, public.history from anon, authenticated;

grant select                         on public.words     to authenticated;
grant select, insert, delete         on public.favorites to authenticated;
grant select, insert, update, delete on public.history   to authenticated;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.words     enable row level security;
alter table public.favorites enable row level security;
alter table public.history   enable row level security;

-- words: any signed-in user can read the list
create policy "Authenticated users can read words"
  on public.words for select
  to authenticated
  using (true);

-- favorites: each user manages only their own rows
create policy "Users can read their own favorites"
  on public.favorites for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own favorites"
  on public.favorites for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can remove their own favorites"
  on public.favorites for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- history: each user manages only their own rows (update is needed for upsert)
create policy "Users can read their own history"
  on public.history for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add to their own history"
  on public.history for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own history"
  on public.history for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can remove their own history"
  on public.history for delete
  to authenticated
  using ((select auth.uid()) = user_id);
