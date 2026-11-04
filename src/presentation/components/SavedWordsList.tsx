import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/presentation/theme';

import { StateMessage } from './StateMessage';
import { WordGrid } from './WordGrid';

interface SavedWordsListProps {
  title: string;
  words: string[];
  emptyTitle: string;
  emptyDescription: string;
  onPressWord: (word: string) => void;
  testID?: string;
}

/** Word grid for the user's history and favorites, with an empty state. */
export function SavedWordsList({
  title,
  words,
  emptyTitle,
  emptyDescription,
  onPressWord,
  testID,
}: SavedWordsListProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <WordGrid
        testID={testID}
        words={words}
        onPressWord={onPressWord}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.md, gap: spacing.xs }}>
            <Text style={[typography.heading, { color: colors.text }]}>{title}</Text>
            {words.length > 0 ? (
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                {words.length === 1 ? '1 palavra' : `${words.length} palavras`}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <StateMessage
            testID={`${testID}-empty`}
            title={emptyTitle}
            description={emptyDescription}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
