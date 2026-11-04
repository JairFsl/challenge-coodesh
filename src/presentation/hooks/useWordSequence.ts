import { useCallback, useState } from 'react';

import type { WordSource } from '@/presentation/navigation/types';

import { useUserWords } from './useUserWords';
import { useWordList } from './useWordList';

interface WordSequence {
  previous: string | null;
  next: string | null;
  canLoadNext: boolean;
  loadNext: () => Promise<string | null>;
}

/**
 * Previous and next words of `word` inside the list the detail was opened from.
 * History and favorites are frozen when the detail opens, so viewing or unfavoriting
 * a word doesn't reorder the sequence while the user is navigating through it.
 */
export function useWordSequence(word: string, source: WordSource): WordSequence {
  const { words: listWords, hasNextPage, fetchNextPage } = useWordList();
  const { favorites, history } = useUserWords();
  const [snapshot] = useState(() => (source === 'history' ? history : favorites));
  const words = source === 'list' ? listWords : snapshot;
  const index = words.indexOf(word);
  const isLastLoaded = index >= 0 && index === words.length - 1;

  const loadNext = useCallback(async () => {
    const result = await fetchNextPage();
    const loaded = result.data?.pages.flatMap(page => page.words) ?? [];
    return loaded[loaded.indexOf(word) + 1] ?? null;
  }, [fetchNextPage, word]);

  return {
    previous: index > 0 ? words[index - 1] : null,
    next: index >= 0 && !isLastLoaded ? words[index + 1] : null,
    canLoadNext: source === 'list' && isLastLoaded && Boolean(hasNextPage),
    loadNext,
  };
}
