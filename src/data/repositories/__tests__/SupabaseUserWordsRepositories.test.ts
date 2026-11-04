import { NetworkError } from '@/core/errors';
import { createQueryBuilder, createSupabaseClient } from '@/test/fakes/fakeSupabaseQuery';

import { SupabaseFavoritesRepository } from '../SupabaseFavoritesRepository';
import { SupabaseHistoryRepository } from '../SupabaseHistoryRepository';

const ok = { data: null, error: null };

describe('SupabaseFavoritesRepository', () => {
  it('lists favorites from the most recent and maps the columns', async () => {
    const builder = createQueryBuilder({
      data: [{ word: 'hello', created_at: '2026-11-04T10:00:00Z' }],
      error: null,
    });
    const { client, from } = createSupabaseClient(builder);

    const favorites = await new SupabaseFavoritesRepository(client).list();

    expect(from).toHaveBeenCalledWith('favorites');
    expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(favorites).toEqual([{ word: 'hello', createdAt: '2026-11-04T10:00:00Z' }]);
  });

  it('adds idempotently keeping the original date on conflict', async () => {
    const builder = createQueryBuilder(ok);
    const { client } = createSupabaseClient(builder);

    await new SupabaseFavoritesRepository(client).add('hello', '2026-11-04T10:00:00Z');

    expect(builder.upsert).toHaveBeenCalledWith(
      { word: 'hello', created_at: '2026-11-04T10:00:00Z' },
      { onConflict: 'user_id,word', ignoreDuplicates: true },
    );
  });

  it('removes by word (RLS scopes it to the signed-in user)', async () => {
    const builder = createQueryBuilder(ok);
    const { client } = createSupabaseClient(builder);

    await new SupabaseFavoritesRepository(client).remove('hello');

    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith('word', 'hello');
  });

  it('maps fetch failures to NetworkError so the operation stays queued', async () => {
    const builder = createQueryBuilder({
      data: null,
      error: { message: 'Network request failed', code: '', details: '', hint: '' },
    });
    const { client } = createSupabaseClient(builder);

    await expect(new SupabaseFavoritesRepository(client).add('hello', 't')).rejects.toBeInstanceOf(
      NetworkError,
    );
  });
});

describe('SupabaseHistoryRepository', () => {
  it('lists the history from the most recent view', async () => {
    const builder = createQueryBuilder({
      data: [{ word: 'hello', viewed_at: '2026-11-04T10:00:00Z' }],
      error: null,
    });
    const { client, from } = createSupabaseClient(builder);

    const history = await new SupabaseHistoryRepository(client).list();

    expect(from).toHaveBeenCalledWith('history');
    expect(builder.order).toHaveBeenCalledWith('viewed_at', { ascending: false });
    expect(history).toEqual([{ word: 'hello', viewedAt: '2026-11-04T10:00:00Z' }]);
  });

  it('upserts one row per word with the view date', async () => {
    const builder = createQueryBuilder(ok);
    const { client } = createSupabaseClient(builder);

    await new SupabaseHistoryRepository(client).add('hello', '2026-11-04T10:00:00Z');

    expect(builder.upsert).toHaveBeenCalledWith(
      { word: 'hello', viewed_at: '2026-11-04T10:00:00Z' },
      { onConflict: 'user_id,word' },
    );
  });
});
