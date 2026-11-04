import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/presentation/components/AppHeader';
import { ConnectivityBanner } from '@/presentation/components/ConnectivityBanner';
import { FavoritesScreen } from '@/presentation/screens/Favorites/FavoritesScreen';
import { HistoryScreen } from '@/presentation/screens/History/HistoryScreen';
import { WordListScreen } from '@/presentation/screens/WordList/WordListScreen';
import { useTheme } from '@/presentation/theme';

import type { HomeTabParamList } from './types';

const Tab = createMaterialTopTabNavigator<HomeTabParamList>();

/** Top tabs from the wireframe: Word list | History | Favorites. */
export function HomeTabs() {
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <AppHeader />
      <ConnectivityBanner />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarIndicatorStyle: { backgroundColor: colors.primary },
          tabBarLabelStyle: { ...typography.label, textTransform: 'none' },
          tabBarStyle: { backgroundColor: colors.surface },
        }}
      >
        <Tab.Screen
          name="WordList"
          component={WordListScreen}
          options={{ title: 'Word list', tabBarButtonTestID: 'tab-word-list' }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{ tabBarButtonTestID: 'tab-history' }}
        />
        <Tab.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{ tabBarButtonTestID: 'tab-favorites' }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
