import { isAxiosError, type AxiosInstance } from 'axios';
import { inject, injectable } from 'tsyringe';

import { AppError, InvalidResponseError, NetworkError, WordNotFoundError } from '@/core/errors';
import { TOKENS } from '@/di/tokens';
import type { WordDefinition } from '@/domain/entities';
import type { DictionaryRepository } from '@/domain/repositories';

import { dictionaryResponseSchema } from '../dtos/dictionaryApi';
import { toWordDefinition } from '../mappers/wordDefinitionMapper';

@injectable()
export class DictionaryApiRepository implements DictionaryRepository {
  constructor(@inject(TOKENS.HttpClient) private readonly http: AxiosInstance) {}

  /** Fetches the word from the Free Dictionary API and validates the response shape. */
  async getDefinition(word: string, signal?: AbortSignal): Promise<WordDefinition> {
    let data: unknown;
    try {
      ({ data } = await this.http.get(`/${encodeURIComponent(word)}`, { signal }));
    } catch (error) {
      throw toDomainError(word, error);
    }

    const parsed = dictionaryResponseSchema.safeParse(data);
    if (!parsed.success) {
      throw new InvalidResponseError(`Unexpected dictionary response for "${word}"`, parsed.error);
    }
    return toWordDefinition(parsed.data);
  }
}

/** 404 means the word has no entry; no response means timeout, offline or cancellation. */
function toDomainError(word: string, error: unknown): AppError {
  if (isAxiosError(error)) {
    if (error.response?.status === 404) {
      return new WordNotFoundError(word);
    }
    if (!error.response) {
      return new NetworkError(error.message, error);
    }
  }
  return new AppError(`Dictionary request failed for "${word}"`, error);
}
