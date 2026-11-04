import { render, screen, userEvent } from '@testing-library/react-native';
import React from 'react';

import { EMPTY_USER_WORDS } from '@/domain/sync/userWords';
import { useAuthStore } from '@/presentation/stores/authStore';
import { useUserWordsStore } from '@/presentation/stores/userWordsStore';
import { TestProviders } from '@/test/TestProviders';

import { HistoryScreen } from '../../History/HistoryScreen';
import { FavoritesScreen } from '../FavoritesScreen';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

function setUserWords(favorites: Record<string, string>, history: Record<string, string>) {
  useUserWordsStore.setState({
    byUser: { 'user-1': { ...EMPTY_USER_WORDS, favorites, history } },
  });
}

describe('Favorites and History screens', () => {
  beforeEach(() => useAuthStore.getState().setUser({ id: 'user-1', email: 'ana@mail.com' }));

  afterEach(() => {
    useUserWordsStore.setState({ byUser: {} });
    jest.clearAllMocks();
  });

  it('lists favorites from the most recent and opens them', async () => {
    setUserWords({ cat: '2026-01', dog: '2026-03' }, {});
    const user = userEvent.setup();
    await render(<FavoritesScreen />, { wrapper: TestProviders });

    expect(screen.getByText('2 palavras')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'dog' }));

    expect(mockNavigate).toHaveBeenCalledWith('WordDetail', { word: 'dog', source: 'favorites' });
  });

  it('explains how to add favorites when there are none', async () => {
    setUserWords({}, {});
    await render(<FavoritesScreen />, { wrapper: TestProviders });

    expect(screen.getByText('Nenhum favorito ainda')).toBeOnTheScreen();
  });

  it('lists the viewed words and opens them from the history', async () => {
    setUserWords({}, { hello: '2026-11-04T10:00:00Z' });
    const user = userEvent.setup();
    await render(<HistoryScreen />, { wrapper: TestProviders });

    await user.press(screen.getByRole('button', { name: 'hello' }));

    expect(mockNavigate).toHaveBeenCalledWith('WordDetail', { word: 'hello', source: 'history' });
  });
});
