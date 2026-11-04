import React, { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/presentation/theme';

interface WordCellProps {
  word: string;
  onPress: (word: string) => void;
}

const WORD_CELL_HEIGHT = 96;

/** Grid cell with a single word, as in the wireframe. */
function WordCellBase({ word, onPress }: WordCellProps) {
  const { colors, typography } = useTheme();

  return (
    <Pressable
      testID={`word-cell-${word}`}
      accessibilityRole="button"
      accessibilityLabel={word}
      onPress={() => onPress(word)}
      style={({ pressed }) => [
        styles.cell,
        {
          borderColor: colors.border,
          backgroundColor: pressed ? colors.primaryMuted : colors.surface,
        },
      ]}
    >
      <Text
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
        style={[typography.body, styles.text, { color: colors.text }]}
      >
        {word}
      </Text>
    </Pressable>
  );
}

export const WordCell = memo(WordCellBase);

const styles = StyleSheet.create({
  cell: {
    height: WORD_CELL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  text: { textAlign: 'center' },
});
