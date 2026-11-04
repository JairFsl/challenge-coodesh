import type { SupabaseClient } from '@supabase/supabase-js';
import { inject, injectable } from 'tsyringe';

import { TOKENS } from '@/di/tokens';
import type { HistoryEntry } from '@/domain/entities';
import type { HistoryRepository } from '@/domain/repositories';

import { toDomainError } from './supabaseErrors';

@injectable()
export class SupabaseHistoryRepository implements HistoryRepository {
  constructor(@inject(TOKENS.SupabaseClient) private readonly supabase: SupabaseClient) {}

  /** RLS returns only the signed-in user's rows, most recent view first. */
  async list(): Promise<HistoryEntry[]> {
    const { data, error } = await this.supabase
      .from('history')
      .select('word, viewed_at')
      .order('viewed_at', { ascending: false });
    if (error) {
      throw toDomainError(error);
    }
    return data.map(row => ({ word: row.word as string, viewedAt: row.viewed_at as string }));
  }

  /**
   * Upserts one row per word. The `history_keep_latest_view` trigger keeps the most
   * recent `viewed_at`, so views synced late (offline devices) never move it backwards.
   */
  async add(word: string, viewedAt: string): Promise<void> {
    const { error } = await this.supabase
      .from('history')
      .upsert({ word, viewed_at: viewedAt }, { onConflict: 'user_id,word' });
    if (error) {
      throw toDomainError(error);
    }
  }
}
