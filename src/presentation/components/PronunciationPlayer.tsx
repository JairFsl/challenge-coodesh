import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { PronunciationSource } from '@/presentation/hooks/usePronunciation';
import { useTheme } from '@/presentation/theme';

interface PronunciationPlayerProps {
  source: PronunciationSource;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  onToggle: () => void;
}

/** Play/pause button with the playback progress bar from the wireframe. */
export function PronunciationPlayer({
  source,
  isPlaying,
  isLoading,
  progress,
  onToggle,
}: PronunciationPlayerProps) {
  const { colors, radius, spacing, typography } = useTheme();
  const filled = isPlaying && source === 'speech' ? 1 : Math.min(Math.max(progress, 0), 1);

  return (
    <View style={{ gap: spacing.xs }}>
      <View style={[styles.row, { gap: spacing.md }]}>
        <Pressable
          testID="play-button"
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pausar pronúncia' : 'Ouvir pronúncia'}
          accessibilityState={{ busy: isLoading }}
          onPress={onToggle}
          disabled={isLoading}
          style={[styles.button, { backgroundColor: colors.primary, borderRadius: radius.full }]}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={[styles.icon, { color: colors.onPrimary }]}>{isPlaying ? '❚❚' : '▶'}</Text>
          )}
        </Pressable>
        <View
          testID="playback-progress"
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(filled * 100) }}
          style={[styles.track, { backgroundColor: colors.surfaceAlt, borderRadius: radius.full }]}
        >
          <View
            style={[
              styles.fill,
              {
                width: `${filled * 100}%`,
                backgroundColor: colors.primary,
                borderRadius: radius.full,
              },
            ]}
          />
        </View>
      </View>
      <Text style={[typography.caption, { color: colors.textMuted }]}>
        {source === 'recording' ? 'Pronúncia gravada' : 'Voz sintetizada do aparelho'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  button: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 18, fontWeight: '700' },
  track: { flex: 1, height: 8, overflow: 'hidden' },
  fill: { height: '100%' },
});
