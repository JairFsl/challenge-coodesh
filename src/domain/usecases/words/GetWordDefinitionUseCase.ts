import { inject, injectable } from 'tsyringe';

import { WordNotFoundError } from '@/core/errors';
import { TOKENS } from '@/di/tokens';

import type { WordDefinition } from '../../entities';
import type { DictionaryRepository } from '../../repositories';

@injectable()
export class GetWordDefinitionUseCase {
  constructor(
    @inject(TOKENS.DictionaryRepository)
    private readonly dictionaryRepository: DictionaryRepository,
  ) {}

  /** Returns the word definition, or null when the dictionary has no entry for it. */
  async execute(word: string, signal?: AbortSignal): Promise<WordDefinition | null> {
    try {
      return await this.dictionaryRepository.getDefinition(word, signal);
    } catch (error) {
      if (error instanceof WordNotFoundError) {
        return null;
      }
      throw error;
    }
  }
}
