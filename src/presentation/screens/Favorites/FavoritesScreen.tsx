import { useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';

import { SavedWordsList } from '@/presentation/components/SavedWordsList';
import { useUserWords } from '@/presentation/hooks/useUserWords';

/** Words saved as favorite, most recently favorited first. */
export function FavoritesScreen() {
  const navigation = useNavigation();
  const { favorites } = useUserWords();

  const openWord = useCallback(
    (word: string) => navigation.navigate('WordDetail', { word, source: 'favorites' }),
    [navigation],
  );

  return (
    <SavedWordsList
      testID="favorites-list"
      title="Favorites"
      words={favorites}
      emptyTitle="Nenhum favorito ainda"
      emptyDescription="Toque na estrela ao abrir uma palavra para salvá-la aqui."
      onPressWord={openWord}
    />
  );
}
