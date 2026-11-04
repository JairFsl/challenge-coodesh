import { FlashList } from '@shopify/flash-list';
import React, { useCallback, type ReactElement } from 'react';
import { StyleSheet } from 'react-native';

import { useTheme } from '@/presentation/theme';

import { WordCell } from './WordCell';

interface WordGridProps {
  words: string[];
  onPressWord: (word: string) => void;
  onEndReached?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  ListHeaderComponent?: ReactElement | null;
  ListFooterComponent?: ReactElement | null;
  ListEmptyComponent?: ReactElement | null;
  testID?: string;
}

const COLUMNS = 3;

/** Virtualized 3-column grid of words, shared by the word list, history and favorites. */
export function WordGrid({ words, onPressWord, ...listProps }: WordGridProps) {
  const { spacing } = useTheme();

  const renderItem = useCallback(
    ({ item }: { item: string }) => <WordCell word={item} onPress={onPressWord} />,
    [onPressWord],
  );

  return (
    <FlashList
      data={words}
      renderItem={renderItem}
      keyExtractor={item => item}
      numColumns={COLUMNS}
      onEndReachedThreshold={0.5}
      contentContainerStyle={{ padding: spacing.lg }}
      style={styles.list}
      {...listProps}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
});
