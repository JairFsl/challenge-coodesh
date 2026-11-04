import { inject, injectable } from 'tsyringe';

import { WORDS_PAGE_SIZE } from '@/core/config/constants';
import { TOKENS } from '@/di/tokens';

import type { WordPage } from '../../entities';
import type { WordListRepository } from '../../repositories';

@injectable()
export class GetWordPageUseCase {
  constructor(
    @inject(TOKENS.WordListRepository) private readonly wordListRepository: WordListRepository,
  ) {}

  /** Returns the next page of the word list after `cursor` (first page when null). */
  execute(cursor: string | null, signal?: AbortSignal): Promise<WordPage> {
    return this.wordListRepository.getPage(cursor, WORDS_PAGE_SIZE, signal);
  }
}
