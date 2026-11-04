import type { SupabaseClient } from '@supabase/supabase-js';
import { inject, injectable } from 'tsyringe';

import { TOKENS } from '@/di/tokens';
import type { FavoriteWord } from '@/domain/entities';
import type { FavoritesRepository } from '@/domain/repositories';

import { toDomainError } from './supabaseErrors';

@injectable()
export class SupabaseFavoritesRepository implements FavoritesRepository {
  constructor(@inject(TOKENS.SupabaseClient) private readonly supabase: SupabaseClient) {}

  /** RLS returns only the signed-in user's rows, so no user filter is needed. */
  async list(): Promise<FavoriteWord[]> {
    const { data, error } = await this.supabase
      .from('favorites')
      .select('word, created_at')
      .order('created_at', { ascending: false });
    if (error) {
      throw toDomainError(error);
    }
    return data.map(row => ({ word: row.word as string, createdAt: row.created_at as string }));
  }

  /**
   * `user_id` defaults to `auth.uid()` in the database. `ignoreDuplicates` turns the
   * upsert into `on conflict do nothing`, so re-sending an add keeps the original date.
   */
  async add(word: string, createdAt: string): Promise<void> {
    const { error } = await this.supabase
      .from('favorites')
      .upsert(
        { word, created_at: createdAt },
        { onConflict: 'user_id,word', ignoreDuplicates: true },
      );
    if (error) {
      throw toDomainError(error);
    }
  }

  /** Deleting a missing row is not an error, which keeps the operation idempotent. */
  async remove(word: string): Promise<void> {
    const { error } = await this.supabase.from('favorites').delete().eq('word', word);
    if (error) {
      throw toDomainError(error);
    }
  }
}
