import 'reflect-metadata';

import { container } from 'tsyringe';

import { httpClient } from '@/data/datasources/httpClient';
import { supabase } from '@/data/datasources/supabase';
import { SupabaseAuthRepository } from '@/data/repositories/SupabaseAuthRepository';
import type { AuthRepository } from '@/domain/repositories';

import { TOKENS } from './tokens';

/** Registers the concrete implementation of each contract (composition root). */
export function registerDependencies(): void {
  container.registerInstance(TOKENS.SupabaseClient, supabase);
  container.registerInstance(TOKENS.HttpClient, httpClient);

  container.registerSingleton<AuthRepository>(TOKENS.AuthRepository, SupabaseAuthRepository);
}

export { container };
