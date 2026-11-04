import { render, screen, userEvent } from '@testing-library/react-native';
import React from 'react';
import { container } from 'tsyringe';

import { NetworkError } from '@/core/errors';
import { TOKENS } from '@/di/tokens';
import { FakeWordListRepository } from '@/test/fakes/FakeWordListRepository';
import { TestProviders } from '@/test/TestProviders';

import { WordListScreen } from '../WordListScreen';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

describe('WordListScreen', () => {
  let repository: FakeWordListRepository;

  beforeEach(() => {
    repository = new FakeWordListRepository(['hello', 'today', 'great', 'peace']);
    container.registerInstance(TOKENS.WordListRepository, repository);
  });

  afterEach(() => {
    container.clearInstances();
    jest.clearAllMocks();
  });

  it('shows the words in the grid', async () => {
    await render(<WordListScreen />, { wrapper: TestProviders });

    expect(await screen.findByRole('button', { name: 'hello' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'peace' })).toBeOnTheScreen();
  });

  it('opens the detail of the pressed word', async () => {
    const user = userEvent.setup();
    await render(<WordListScreen />, { wrapper: TestProviders });

    await user.press(await screen.findByRole('button', { name: 'great' }));

    expect(mockNavigate).toHaveBeenCalledWith('WordDetail', { word: 'great', source: 'list' });
  });

  it('shows an error with a retry action when the first page fails', async () => {
    repository.getPage.mockRejectedValueOnce(new NetworkError('offline'));
    const user = userEvent.setup();
    await render(<WordListScreen />, { wrapper: TestProviders });

    expect(await screen.findByText('Não foi possível carregar as palavras')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('button', { name: 'hello' })).toBeOnTheScreen();
  });
});
