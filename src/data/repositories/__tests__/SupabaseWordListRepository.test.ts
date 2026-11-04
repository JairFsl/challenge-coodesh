import { AppError, NetworkError } from '@/core/errors';
import {
  createQueryBuilder,
  createSupabaseClient,
  type FakeQueryBuilder,
} from '@/test/fakes/fakeSupabaseQuery';

import { SupabaseWordListRepository } from '../SupabaseWordListRepository';

function createRepository(builder: FakeQueryBuilder) {
  const { client, from } = createSupabaseClient(builder);
  return { repository: new SupabaseWordListRepository(client), supabase: { from } };
}

describe('SupabaseWordListRepository', () => {
  it('loads the first page ordered by word and uses the last word as next cursor', async () => {
    const builder = createQueryBuilder({
      data: [{ word: 'a' }, { word: 'aa' }, { word: 'aah' }],
      error: null,
    });
    const { repository, supabase } = createRepository(builder);

    const page = await repository.getPage(null, 3);

    expect(supabase.from).toHaveBeenCalledWith('words');
    expect(builder.order).toHaveBeenCalledWith('word');
    expect(builder.limit).toHaveBeenCalledWith(3);
    expect(builder.gt).not.toHaveBeenCalled();
    expect(page).toEqual({ words: ['a', 'aa', 'aah'], nextCursor: 'aah' });
  });

  it('continues after the cursor and stops when the page is incomplete', async () => {
    const builder = createQueryBuilder({ data: [{ word: 'zyzzyvas' }], error: null });
    const { repository } = createRepository(builder);
    const controller = new AbortController();

    const page = await repository.getPage('zyzzyva', 3, controller.signal);

    expect(builder.gt).toHaveBeenCalledWith('word', 'zyzzyva');
    expect(builder.abortSignal).toHaveBeenCalledWith(controller.signal);
    expect(page).toEqual({ words: ['zyzzyvas'], nextCursor: null });
  });

  it('maps fetch failures (empty code) to NetworkError', async () => {
    const builder = createQueryBuilder({
      data: null,
      error: { message: 'TypeError: Network request failed', code: '', details: '', hint: '' },
    });
    const { repository } = createRepository(builder);

    await expect(repository.getPage(null, 3)).rejects.toBeInstanceOf(NetworkError);
  });

  it('maps database errors to AppError', async () => {
    const builder = createQueryBuilder({
      data: null,
      error: { message: 'permission denied', code: '42501', details: '', hint: '' },
    });
    const { repository } = createRepository(builder);

    const promise = repository.getPage(null, 3);

    await expect(promise).rejects.toBeInstanceOf(AppError);
    await expect(promise).rejects.not.toBeInstanceOf(NetworkError);
  });
});
