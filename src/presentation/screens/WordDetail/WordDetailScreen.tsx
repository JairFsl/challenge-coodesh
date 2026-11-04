import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getPronunciationAudio } from '@/domain/entities';
import { Button } from '@/presentation/components/Button';
import { MeaningsList } from '@/presentation/components/MeaningsList';
import { PronunciationPlayer } from '@/presentation/components/PronunciationPlayer';
import { StateMessage } from '@/presentation/components/StateMessage';
import { useIsOnline } from '@/presentation/hooks/useIsOnline';
import { usePronunciation } from '@/presentation/hooks/usePronunciation';
import { useUserWords } from '@/presentation/hooks/useUserWords';
import { useWordDefinition } from '@/presentation/hooks/useWordDefinition';
import { useWordSequence } from '@/presentation/hooks/useWordSequence';
import type { RootStackParamList } from '@/presentation/navigation/types';
import { useTheme } from '@/presentation/theme';
import { getErrorMessage } from '@/presentation/utils/errorMessages';

type WordDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'WordDetail'>;

/** Word, phonetic, pronunciation player and meanings, with favorite and previous/next actions. */
export function WordDetailScreen({ navigation, route }: WordDetailScreenProps) {
  const { word, source } = route.params;
  const { colors, radius, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const isOnline = useIsOnline();
  const [isLoadingNext, setIsLoadingNext] = useState(false);

  const { data: definition, status, fetchStatus, error, refetch } = useWordDefinition(word);
  const pronunciation = usePronunciation(
    word,
    definition ? getPronunciationAudio(definition) : undefined,
  );
  const sequence = useWordSequence(word, source);
  const { isFavorite, toggleFavorite, recordView } = useUserWords();
  const favorite = isFavorite(word);

  useEffect(() => {
    recordView(word);
  }, [word, recordView]);

  const showWord = (nextWord: string) => navigation.setParams({ word: nextWord });

  const goNext = async () => {
    if (sequence.next) {
      return showWord(sequence.next);
    }
    setIsLoadingNext(true);
    try {
      const loaded = await sequence.loadNext();
      if (loaded) {
        showWord(loaded);
      }
    } finally {
      setIsLoadingNext(false);
    }
  };

  const renderMeanings = () => {
    if (status === 'pending' && fetchStatus === 'paused') {
      return (
        <StateMessage
          testID="detail-offline"
          title="Sem conexão"
          description="Os significados desta palavra ainda não foram salvos no aparelho."
        />
      );
    }
    if (status === 'pending') {
      return <ActivityIndicator testID="detail-loading" color={colors.primary} />;
    }
    if (status === 'error') {
      return (
        <StateMessage
          testID="detail-error"
          title="Não foi possível carregar os significados"
          description={getErrorMessage(error)}
          actionLabel="Tentar novamente"
          onAction={() => refetch()}
        />
      );
    }
    if (!definition) {
      return (
        <StateMessage
          testID="detail-not-found"
          title="Sem definições"
          description="O dicionário não possui significados para esta palavra. Você ainda pode ouvir a pronúncia."
        />
      );
    }
    return <MeaningsList meanings={definition.meanings} />;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.sm,
          paddingBottom: insets.bottom + spacing.md,
        },
      ]}
    >
      <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
        <Pressable
          testID="close-button"
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          hitSlop={12}
          onPress={() => navigation.goBack()}
        >
          <Text style={[typography.heading, { color: colors.text }]}>✕</Text>
        </Pressable>
        <Pressable
          testID="favorite-button"
          accessibilityRole="button"
          accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          accessibilityState={{ selected: favorite }}
          hitSlop={12}
          onPress={() => toggleFavorite(word)}
        >
          <Text style={[styles.star, { color: favorite ? colors.warning : colors.textMuted }]}>
            {favorite ? '★' : '☆'}
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <View
          testID="word-card"
          style={[
            styles.card,
            { backgroundColor: colors.highlight, borderRadius: radius.lg, padding: spacing.xl },
          ]}
        >
          <Text
            testID="detail-word"
            style={[typography.title, styles.center, { color: colors.text }]}
          >
            {word}
          </Text>
          {definition?.phonetic ? (
            <Text
              testID="detail-phonetic"
              style={[typography.heading, styles.center, { color: colors.textMuted }]}
            >
              {definition.phonetic}
            </Text>
          ) : null}
        </View>

        <PronunciationPlayer
          source={pronunciation.source}
          isPlaying={pronunciation.isPlaying}
          isLoading={pronunciation.isLoading}
          progress={pronunciation.progress}
          onToggle={pronunciation.toggle}
        />

        <Text style={[typography.title, { color: colors.text }]}>Meanings</Text>
        {renderMeanings()}
      </ScrollView>

      <View style={[styles.footer, { gap: spacing.md, paddingHorizontal: spacing.lg }]}>
        <Button
          testID="previous-button"
          title="Voltar"
          variant="outline"
          style={styles.flex}
          disabled={!sequence.previous}
          onPress={() => sequence.previous && showWord(sequence.previous)}
        />
        <Button
          testID="next-button"
          title="Próximo"
          variant="outline"
          style={styles.flex}
          loading={isLoadingNext}
          disabled={!sequence.next && !(sequence.canLoadNext && isOnline)}
          onPress={goNext}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  star: { fontSize: 28 },
  card: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 12 },
  center: { textAlign: 'center' },
  footer: { flexDirection: 'row' },
  flex: { flex: 1 },
});
