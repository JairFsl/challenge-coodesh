import { useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/presentation/components/Button';
import { LoadingScreen } from '@/presentation/components/LoadingScreen';
import { StateMessage } from '@/presentation/components/StateMessage';
import { WordGrid } from '@/presentation/components/WordGrid';
import { useIsOnline } from '@/presentation/hooks/useIsOnline';
import { useWordList } from '@/presentation/hooks/useWordList';
import { useTheme } from '@/presentation/theme';
import { getErrorMessage } from '@/presentation/utils/errorMessages';

/** Infinite scroll grid with every word of the dictionary. */
export function WordListScreen() {
  const navigation = useNavigation();
  const isOnline = useIsOnline();
  const { colors, spacing, typography } = useTheme();
  const {
    words,
    status,
    fetchStatus,
    error,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
    refetch,
  } = useWordList();

  const openWord = useCallback(
    (word: string) => navigation.navigate('WordDetail', { word, source: 'list' }),
    [navigation],
  );

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && isOnline) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isOnline, fetchNextPage]);

  if (status === 'pending' && fetchStatus === 'paused') {
    return (
      <StateMessage
        testID="word-list-offline"
        title="Sem conexão"
        description="Conecte-se à internet para carregar a lista de palavras pela primeira vez."
      />
    );
  }

  if (status === 'pending') {
    return <LoadingScreen />;
  }

  if (status === 'error' && words.length === 0) {
    return (
      <StateMessage
        testID="word-list-error"
        title="Não foi possível carregar as palavras"
        description={getErrorMessage(error)}
        actionLabel="Tentar novamente"
        onAction={() => refetch()}
      />
    );
  }

  const footer = isFetchingNextPage ? (
    <ActivityIndicator testID="word-list-loading-more" color={colors.primary} />
  ) : isFetchNextPageError ? (
    <Button title="Tentar carregar mais" variant="ghost" onPress={() => fetchNextPage()} />
  ) : hasNextPage && !isOnline ? (
    <Text style={[typography.caption, styles.center, { color: colors.textMuted }]}>
      Conecte-se para carregar mais palavras.
    </Text>
  ) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <WordGrid
        testID="word-list"
        words={words}
        onPressWord={openWord}
        onEndReached={loadMore}
        ListHeaderComponent={
          <Text style={[typography.heading, { color: colors.text, marginBottom: spacing.md }]}>
            Word list
          </Text>
        }
        ListFooterComponent={<View style={{ paddingVertical: spacing.lg }}>{footer}</View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { textAlign: 'center' },
});
