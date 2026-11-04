import type { SupabaseClient } from '@supabase/supabase-js';
import { inject, injectable } from 'tsyringe';

import { TOKENS } from '@/di/tokens';
import type { WordPage } from '@/domain/entities';
import type { WordListRepository } from '@/domain/repositories';

import { toDomainError } from './supabaseErrors';

@injectable()
export class SupabaseWordListRepository implements WordListRepository {
  constructor(@inject(TOKENS.SupabaseClient) private readonly supabase: SupabaseClient) {}

  /**
   * Keyset pagination over the `words` primary key: `word > cursor order by word limit n`
   * uses the index directly, so every page costs the same regardless of its depth
   * (OFFSET would scan all the skipped rows of the 370k-word table).
   */
  async getPage(cursor: string | null, limit: number, signal?: AbortSignal): Promise<WordPage> {
    let query = this.supabase.from('words').select('word').order('word').limit(limit);
    if (cursor) {
      query = query.gt('word', cursor);
    }
    if (signal) {
      query = query.abortSignal(signal);
    }

    const { data, error } = await query;
    if (error) {
      throw toDomainError(error);
    }

    const words = data.map(row => row.word as string);
    return {
      words,
      nextCursor: words.length === limit ? words[words.length - 1] : null,
    };
  }
}
