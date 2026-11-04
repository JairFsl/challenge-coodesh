import { AppError, NetworkError, WordNotFoundError } from '../AppError';

describe('AppError', () => {
  it('keeps the subclass name and the original cause', () => {
    const cause = new Error('socket hang up');
    const error = new NetworkError('Request failed', cause);

    expect(error).toBeInstanceOf(AppError);
    expect(error.name).toBe('NetworkError');
    expect(error.cause).toBe(cause);
  });

  it('builds a readable message for words without definitions', () => {
    const error = new WordNotFoundError('xyzzy');

    expect(error.word).toBe('xyzzy');
    expect(error.message).toBe('No definitions found for "xyzzy"');
  });
});
