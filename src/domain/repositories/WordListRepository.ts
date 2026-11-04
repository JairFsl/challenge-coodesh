import type { WordPage } from '../entities';

export interface WordListRepository {
  /** Returns the words after `cursor` in alphabetical order (first page when null). */
  getPage(cursor: string | null, limit: number, signal?: AbortSignal): Promise<WordPage>;
}
