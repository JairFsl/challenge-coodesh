import type { WordPage } from '@/domain/entities';
import type { WordListRepository } from '@/domain/repositories';

/** WordListRepository that paginates an in-memory, alphabetically sorted list. */
export class FakeWordListRepository implements WordListRepository {
  constructor(private readonly words: string[]) {}

  getPage = jest.fn(async (cursor: string | null, limit: number): Promise<WordPage> => {
    const start = cursor ? this.words.indexOf(cursor) + 1 : 0;
    const words = this.words.slice(start, start + limit);
    return { words, nextCursor: words.length === limit ? words[words.length - 1] : null };
  });
}
