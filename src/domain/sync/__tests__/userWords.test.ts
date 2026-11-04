import type { PendingOperation, PendingOperationType } from '../../entities';
import {
  EMPTY_USER_WORDS,
  enqueueOperation,
  mergeRemote,
  removeSynced,
  toFavoriteList,
  toHistoryList,
} from '../userWords';

let sequence = 0;
function operation(type: PendingOperationType, word: string, createdAt: string): PendingOperation {
  sequence += 1;
  return { id: `op-${sequence}`, userId: 'user-1', type, word, createdAt };
}

describe('userWords sync rules', () => {
  it('applies a favorite locally and queues it', () => {
    const state = enqueueOperation(EMPTY_USER_WORDS, operation('favorite.add', 'hello', 't1'));

    expect(state.favorites).toEqual({ hello: 't1' });
    expect(state.pending).toHaveLength(1);
  });

  it('keeps only the latest pending change per word (favorite then unfavorite offline)', () => {
    const added = enqueueOperation(EMPTY_USER_WORDS, operation('favorite.add', 'hello', 't1'));
    const removed = enqueueOperation(added, operation('favorite.remove', 'hello', 't2'));

    expect(removed.favorites).toEqual({});
    expect(removed.pending.map(p => p.type)).toEqual(['favorite.remove']);
  });

  it('does not mix favorite and history changes of the same word', () => {
    let state = enqueueOperation(EMPTY_USER_WORDS, operation('history.add', 'hello', 't1'));
    state = enqueueOperation(state, operation('favorite.add', 'hello', 't2'));
    state = enqueueOperation(state, operation('history.add', 'hello', 't3'));

    expect(state.pending.map(p => `${p.type}@${p.createdAt}`)).toEqual([
      'favorite.add@t2',
      'history.add@t3',
    ]);
    expect(state.history).toEqual({ hello: 't3' });
  });

  it('never moves a view backwards', () => {
    const recent = enqueueOperation(EMPTY_USER_WORDS, operation('history.add', 'hello', '2026-02'));
    const older = enqueueOperation(recent, operation('history.add', 'hello', '2026-01'));

    expect(older.history.hello).toBe('2026-02');
  });

  it('keeps the original date when a word is favorited again', () => {
    const first = enqueueOperation(EMPTY_USER_WORDS, operation('favorite.add', 'hello', 't1'));
    const again = enqueueOperation(first, operation('favorite.add', 'hello', 't2'));

    expect(again.favorites.hello).toBe('t1');
  });

  it('merges the server copy re-applying the changes not synced yet', () => {
    const pending = [
      operation('favorite.remove', 'cat', 't5'),
      operation('favorite.add', 'dog', 't6'),
    ];

    const state = mergeRemote(
      {
        favorites: [
          { word: 'cat', createdAt: 't1' },
          { word: 'owl', createdAt: 't2' },
        ],
        history: [{ word: 'owl', viewedAt: 't3' }],
      },
      pending,
    );

    expect(state.favorites).toEqual({ owl: 't2', dog: 't6' });
    expect(state.history).toEqual({ owl: 't3' });
    expect(state.pending).toBe(pending);
  });

  it('removes only the operations confirmed by the server', () => {
    let state = enqueueOperation(EMPTY_USER_WORDS, operation('favorite.add', 'a', 't1'));
    state = enqueueOperation(state, operation('favorite.add', 'b', 't2'));

    const synced = removeSynced(state, [state.pending[0].id]);

    expect(synced.pending.map(p => p.word)).toEqual(['b']);
  });

  it('lists favorites and history from the most recent', () => {
    const state = {
      ...EMPTY_USER_WORDS,
      favorites: { a: '2026-01', b: '2026-03', c: '2026-02' },
      history: { x: '2026-02', y: '2026-01' },
    };

    expect(toFavoriteList(state).map(f => f.word)).toEqual(['b', 'c', 'a']);
    expect(toHistoryList(state).map(h => h.word)).toEqual(['x', 'y']);
  });
});
