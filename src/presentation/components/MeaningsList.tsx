import React from 'react';
import { Text, View } from 'react-native';

import type { Meaning } from '@/domain/entities';
import { useTheme } from '@/presentation/theme';

interface MeaningsListProps {
  meanings: Meaning[];
}

/** Meanings grouped by part of speech, each definition with its example. */
export function MeaningsList({ meanings }: MeaningsListProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View testID="meanings-list" style={{ gap: spacing.lg }}>
      {meanings.map((meaning, meaningIndex) => (
        <View key={`${meaning.partOfSpeech}-${meaningIndex}`} style={{ gap: spacing.sm }}>
          <Text style={[typography.label, { color: colors.primary }]}>{meaning.partOfSpeech}</Text>
          {meaning.definitions.map((definition, index) => (
            <View key={index} style={{ gap: spacing.xs }}>
              <Text style={[typography.body, { color: colors.text }]}>
                {index + 1}. {definition.definition}
              </Text>
              {definition.example ? (
                <Text style={[typography.caption, { color: colors.textMuted }]}>
                  “{definition.example}”
                </Text>
              ) : null}
            </View>
          ))}
          {meaning.synonyms.length > 0 ? (
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              Sinônimos: {meaning.synonyms.slice(0, 6).join(', ')}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}
