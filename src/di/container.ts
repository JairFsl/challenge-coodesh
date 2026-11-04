import 'reflect-metadata';

import { container } from 'tsyringe';

import { httpClient } from '@/data/datasources/httpClient';
import { supabase } from '@/data/datasources/supabase';
import { SupabaseAuthRepository } from '@/data/repositories/SupabaseAuthRepository';
import { SupabaseFavoritesRepository } from '@/data/repositories/SupabaseFavoritesRepository';
import { SupabaseHistoryRepository } from '@/data/repositories/SupabaseHistoryRepository';
import { SupabaseWordListRepository } from '@/data/repositories/SupabaseWordListRepository';
import type {
  AuthRepository,
  FavoritesRepository,
  HistoryRepository,
  WordListRepository,
} from '@/domain/repositories';

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
  container.registerSingleton<FavoritesRepository>(
    TOKENS.FavoritesRepository,
    SupabaseFavoritesRepository,
  );
  container.registerSingleton<HistoryRepository>(
    TOKENS.HistoryRepository,
    SupabaseHistoryRepository,
  );
}

export { container };
