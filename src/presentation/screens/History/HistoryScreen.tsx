import { useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';

import { SavedWordsList } from '@/presentation/components/SavedWordsList';
import { useUserWords } from '@/presentation/hooks/useUserWords';

/** Words the user has already viewed, most recent first. */
export function HistoryScreen() {
  const navigation = useNavigation();
  const { history } = useUserWords();

  const openWord = useCallback(
    (word: string) => navigation.navigate('WordDetail', { word, source: 'history' }),
    [navigation],
  );

  return (
    <SavedWordsList
      testID="history-list"
      title="History"
      words={history}
      emptyTitle="Nenhuma palavra vista ainda"
      emptyDescription="As palavras que você abrir aparecem aqui, da mais recente para a mais antiga."
      onPressWord={openWord}
    />
  );
}
