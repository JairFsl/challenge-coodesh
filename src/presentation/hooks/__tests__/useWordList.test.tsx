import { act, renderHook, waitFor } from '@testing-library/react-native';
import { container } from 'tsyringe';

import { WORDS_PAGE_SIZE } from '@/core/config/constants';
import { TOKENS } from '@/di/tokens';
import { FakeWordListRepository } from '@/test/fakes/FakeWordListRepository';
import { TestProviders } from '@/test/TestProviders';

import { useWordList } from '../useWordList';

const ALL_WORDS = Array.from(
  { length: WORDS_PAGE_SIZE + 5 },
  (_, index) => `word${String(index).padStart(3, '0')}`,
);

describe('useWordList', () => {
  let repository: FakeWordListRepository;

  beforeEach(() => {
    repository = new FakeWordListRepository(ALL_WORDS);
    container.registerInstance(TOKENS.WordListRepository, repository);
  });

  afterEach(() => container.clearInstances());

  it('loads pages sequentially using the last word as cursor', async () => {
    const { result } = await renderHook(() => useWordList(), { wrapper: TestProviders });

    await waitFor(() => expect(result.current.words).toHaveLength(WORDS_PAGE_SIZE));
    expect(result.current.hasNextPage).toBe(true);

    await act(() => result.current.fetchNextPage());

    await waitFor(() => expect(result.current.words).toHaveLength(ALL_WORDS.length));
    expect(repository.getPage).toHaveBeenLastCalledWith(
      ALL_WORDS[WORDS_PAGE_SIZE - 1],
      WORDS_PAGE_SIZE,
      expect.any(AbortSignal),
    );
    expect(result.current.hasNextPage).toBe(false);
  });
});
