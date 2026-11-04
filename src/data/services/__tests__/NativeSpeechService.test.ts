import Speech from '@mhpdev/react-native-speech';

import { AppError } from '@/core/errors';

import { NativeSpeechService } from '../NativeSpeechService';

const mockListeners: Record<'finish' | 'error', Array<() => void>> = { finish: [], error: [] };

jest.mock('@mhpdev/react-native-speech', () => ({
  __esModule: true,
  default: {
    speak: jest.fn(async () => 'utterance-1'),
    stop: jest.fn(async () => {}),
    onFinish: jest.fn((listener: () => void) => {
      mockListeners.finish.push(listener);
      return { remove: jest.fn() };
    }),
    onError: jest.fn((listener: () => void) => {
      mockListeners.error.push(listener);
      return { remove: jest.fn() };
    }),
  },
}));

describe('NativeSpeechService', () => {
  let service: NativeSpeechService;

  beforeEach(() => {
    jest.useFakeTimers();
    mockListeners.finish = [];
    mockListeners.error = [];
    service = new NativeSpeechService();
  });

  afterEach(() => jest.useRealTimers());

  it('speaks in English and resolves when the engine finishes', async () => {
    const speaking = service.speak('hello');
    mockListeners.finish.forEach(listener => listener());

    await expect(speaking).resolves.toBeUndefined();
    expect(Speech.speak).toHaveBeenCalledWith('hello', { language: 'en-US' });
  });

  it('rejects when the engine reports an error', async () => {
    const speaking = service.speak('hello');
    mockListeners.error.forEach(listener => listener());

    await expect(speaking).rejects.toBeInstanceOf(AppError);
  });

  it('resolves the pending utterance when stopped', async () => {
    const speaking = service.speak('hello');
    service.stop();

    await expect(speaking).resolves.toBeUndefined();
  });

  it('resolves after the timeout when the engine never reports the end', async () => {
    const speaking = service.speak('hello');
    jest.advanceTimersByTime(5_000);

    await expect(speaking).resolves.toBeUndefined();
  });
});
