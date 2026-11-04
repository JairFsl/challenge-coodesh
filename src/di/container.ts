import 'reflect-metadata';

import { container } from 'tsyringe';

import { httpClient } from '@/data/datasources/httpClient';
import { supabase } from '@/data/datasources/supabase';
import { DictionaryApiRepository } from '@/data/repositories/DictionaryApiRepository';
import { SupabaseAuthRepository } from '@/data/repositories/SupabaseAuthRepository';
import { SupabaseFavoritesRepository } from '@/data/repositories/SupabaseFavoritesRepository';
import { SupabaseHistoryRepository } from '@/data/repositories/SupabaseHistoryRepository';
import { SupabaseWordListRepository } from '@/data/repositories/SupabaseWordListRepository';
import { NativeSpeechService } from '@/data/services/NativeSpeechService';
import { SoundAudioPlayer } from '@/data/services/SoundAudioPlayer';
import type {
  AuthRepository,
  DictionaryRepository,
  FavoritesRepository,
  HistoryRepository,
  WordListRepository,
} from '@/domain/repositories';
import type { AudioPlayer, SpeechService } from '@/domain/services';

import { TOKENS } from './tokens';

/** Registers the concrete implementation of each contract (composition root). */
export function registerDependencies(): void {
  container.registerInstance(TOKENS.SupabaseClient, supabase);
  container.registerInstance(TOKENS.HttpClient, httpClient);

  container.registerSingleton<AuthRepository>(TOKENS.AuthRepository, SupabaseAuthRepository);
  container.registerSingleton<WordListRepository>(
    TOKENS.WordListRepository,
    SupabaseWordListRepository,
  );
  container.registerSingleton<DictionaryRepository>(
    TOKENS.DictionaryRepository,
    DictionaryApiRepository,
  );
  container.registerSingleton<FavoritesRepository>(
    TOKENS.FavoritesRepository,
    SupabaseFavoritesRepository,
  );
  container.registerSingleton<HistoryRepository>(
    TOKENS.HistoryRepository,
    SupabaseHistoryRepository,
  );

  container.registerSingleton<AudioPlayer>(TOKENS.AudioPlayer, SoundAudioPlayer);
  container.registerSingleton<SpeechService>(TOKENS.SpeechService, NativeSpeechService);
}

export { container };
