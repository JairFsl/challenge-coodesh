import type { WordDefinition } from '../entities';

export interface DictionaryRepository {
  /**
   * Fetches phonetics and meanings of a word.
   * @throws WordNotFoundError when the dictionary has no entry for the word
   * @throws NetworkError on connectivity problems or timeouts
   */
  getDefinition(word: string, signal?: AbortSignal): Promise<WordDefinition>;
}
