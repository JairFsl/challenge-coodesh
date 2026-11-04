import { render, screen, userEvent } from '@testing-library/react-native';
import React from 'react';
import { container } from 'tsyringe';

import { WordNotFoundError } from '@/core/errors';
import { TOKENS } from '@/di/tokens';
import type { WordDefinition } from '@/domain/entities';
import type { DictionaryRepository } from '@/domain/repositories';
import { useAuthStore } from '@/presentation/stores/authStore';
import { useUserWordsStore } from '@/presentation/stores/userWordsStore';
import { FakeAudioPlayer, FakeSpeechService } from '@/test/fakes/FakeMediaServices';
import { FakeWordListRepository } from '@/test/fakes/FakeWordListRepository';
import { TestProviders } from '@/test/TestProviders';

import { WordDetailScreen } from '../WordDetailScreen';

type Props = React.ComponentProps<typeof WordDetailScreen>;

const hello: WordDefinition = {
  word: 'hello',
  phonetic: '/həˈləʊ/',
  phonetics: [{ text: '/həˈləʊ/', audioUrl: 'https://audio/hello.mp3' }],
  meanings: [
    {
      partOfSpeech: 'noun',
      definitions: [
        { definition: '"Hello!" or an equivalent greeting.', synonyms: [], antonyms: [] },
      ],
      synonyms: [],
      antonyms: [],
    },
  ],
  sourceUrls: [],
};

describe('WordDetailScreen', () => {
  let dictionary: { getDefinition: jest.Mock };
  const navigation = { setParams: jest.fn(), goBack: jest.fn() };

  beforeEach(() => {
    dictionary = {
      getDefinition: jest.fn(async (word: string) => {
        if (word !== 'hello') {
          throw new WordNotFoundError(word);
        }
        return hello;
      }),
    };
    container.registerInstance<DictionaryRepository>(TOKENS.DictionaryRepository, dictionary);
    container.registerInstance(
      TOKENS.WordListRepository,
      new FakeWordListRepository(['great', 'hello', 'today']),
    );
    container.registerInstance(TOKENS.AudioPlayer, new FakeAudioPlayer());
    container.registerInstance(TOKENS.SpeechService, new FakeSpeechService());
    useAuthStore.getState().setUser({ id: 'user-1', email: 'ana@mail.com' });
    useUserWordsStore.setState({ byUser: {} });
  });

  afterEach(() => {
    container.clearInstances();
    jest.clearAllMocks();
  });

  async function renderScreen(word: string) {
    await render(
      <WordDetailScreen
        navigation={navigation as unknown as Props['navigation']}
        route={{ key: 'WordDetail', name: 'WordDetail', params: { word, source: 'list' } }}
      />,
      { wrapper: TestProviders },
    );
  }

  it('shows the word, its phonetic and meanings', async () => {
    await renderScreen('hello');

    expect(await screen.findByText('/həˈləʊ/')).toBeOnTheScreen();
    expect(screen.getByText('1. "Hello!" or an equivalent greeting.')).toBeOnTheScreen();
    expect(screen.getByText('Pronúncia gravada')).toBeOnTheScreen();
  });

  it('explains when the dictionary has no definition and offers TTS', async () => {
    await renderScreen('today');

    expect(await screen.findByText('Sem definições')).toBeOnTheScreen();
    expect(screen.getByText('Voz sintetizada do aparelho')).toBeOnTheScreen();
  });

  it('navigates to the previous and next words of the list', async () => {
    const user = userEvent.setup();
    await renderScreen('hello');
    await screen.findByText('/həˈləʊ/');

    await user.press(screen.getByRole('button', { name: 'Próximo' }));
    expect(navigation.setParams).toHaveBeenCalledWith({ word: 'today' });

    await user.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(navigation.setParams).toHaveBeenCalledWith({ word: 'great' });
  });

  it('closes the modal', async () => {
    const user = userEvent.setup();
    await renderScreen('hello');

    await user.press(screen.getByRole('button', { name: 'Fechar' }));

    expect(navigation.goBack).toHaveBeenCalled();
  });
  it('records the view in the history', async () => {
    await renderScreen('hello');

    expect(useUserWordsStore.getState().byUser['user-1'].history).toHaveProperty('hello');
  });

  it('adds and removes the word from favorites', async () => {
    const user = userEvent.setup();
    await renderScreen('hello');

    await user.press(screen.getByRole('button', { name: 'Adicionar aos favoritos' }));
    expect(useUserWordsStore.getState().byUser['user-1'].favorites).toHaveProperty('hello');

    await user.press(screen.getByRole('button', { name: 'Remover dos favoritos' }));
    expect(useUserWordsStore.getState().byUser['user-1'].favorites).not.toHaveProperty('hello');
  });
});
