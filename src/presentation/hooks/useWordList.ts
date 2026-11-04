import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { GetWordPageUseCase } from '@/domain/usecases/words';

import { useDependency } from './useDependency';

const WORD_LIST_QUERY_KEY = ['words', 'list'] as const;

/** Infinite, cursor-paginated word list (pages are cached and persisted for offline use). */
export function useWordList() {
  const getWordPage = useDependency(GetWordPageUseCase);

  const query = useInfiniteQuery({
    queryKey: WORD_LIST_QUERY_KEY,
    queryFn: ({ pageParam, signal }) => getWordPage.execute(pageParam, signal),
    initialPageParam: null as string | null,
    getNextPageParam: lastPage => lastPage.nextCursor,
  });

  const words = useMemo(() => query.data?.pages.flatMap(page => page.words) ?? [], [query.data]);

  return { ...query, words };
}
