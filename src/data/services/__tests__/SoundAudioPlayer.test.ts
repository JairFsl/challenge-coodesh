import Sound from 'react-native-sound';

import { NetworkError } from '@/core/errors';
import type { PlaybackState } from '@/domain/services';

import { SoundAudioPlayer } from '../SoundAudioPlayer';

type MockLoadCallback = (error: unknown) => void;
type MockEndCallback = (success: boolean) => void;

const mockInstances: Array<{
  url: string;
  onLoad: MockLoadCallback;
  onEnd?: MockEndCallback;
  release: jest.Mock;
}> = [];

jest.mock('react-native-sound', () => {
  const MockSound = jest.fn().mockImplementation((url: string, onLoad: MockLoadCallback) => {
    const instance = {
      url,
      onLoad,
      onEnd: undefined as MockEndCallback | undefined,
      play: jest.fn((onEnd: MockEndCallback) => {
        instance.onEnd = onEnd;
      }),
      pause: jest.fn(),
      stop: jest.fn(),
      release: jest.fn(),
      getDuration: jest.fn(() => 2),
      getCurrentTime: jest.fn((callback: (seconds: number) => void) => callback(1)),
    };
    mockInstances.push(instance);
    return instance;
  });
  (MockSound as unknown as { setCategory: jest.Mock }).setCategory = jest.fn();
  return MockSound;
});

describe('SoundAudioPlayer', () => {
  let states: PlaybackState[];
  let player: SoundAudioPlayer;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.mocked(Sound).mockClear();
    mockInstances.length = 0;
    states = [];
    player = new SoundAudioPlayer();
    player.subscribe(state => states.push(state));
  });

  afterEach(() => jest.useRealTimers());

  it('loads, plays, reports progress and returns to idle when finished', async () => {
    const playing = player.play('https://audio/hello.mp3');
    mockInstances[0].onLoad(null);
    await playing;

    expect(states.at(-1)).toEqual({ status: 'playing', position: 0, duration: 2 });

    jest.advanceTimersByTime(250);
    expect(states.at(-1)).toEqual({ status: 'playing', position: 1, duration: 2 });

    mockInstances[0].onEnd?.(true);
    expect(states.at(-1)).toEqual({ status: 'idle', position: 0, duration: 2 });
  });

  it('resumes the already loaded audio instead of downloading it again', async () => {
    const first = player.play('https://audio/hello.mp3');
    mockInstances[0].onLoad(null);
    await first;
    player.pause();

    await player.play('https://audio/hello.mp3');

    expect(Sound).toHaveBeenCalledTimes(1);
    expect(states.at(-1)?.status).toBe('playing');
  });

  it('rejects with NetworkError and reports error when the file cannot be loaded', async () => {
    const playing = player.play('https://audio/missing.mp3');
    mockInstances[0].onLoad(new Error('502'));

    await expect(playing).rejects.toBeInstanceOf(NetworkError);
    expect(states.at(-1)?.status).toBe('error');
  });
  it('gives up with NetworkError when the file takes too long to load', async () => {
    const playing = player.play('https://audio/slow.mp3');
    jest.advanceTimersByTime(8_000);

    await expect(playing).rejects.toBeInstanceOf(NetworkError);
    expect(states.at(-1)?.status).toBe('error');

    mockInstances[0].onLoad(null);
    expect(mockInstances[0].release).toHaveBeenCalled();
  });
});
