import type { AudioPlayer, PlaybackState, SpeechService } from '@/domain/services';

/** AudioPlayer that records calls and lets tests push playback states. */
export class FakeAudioPlayer implements AudioPlayer {
  private listener: ((state: PlaybackState) => void) | null = null;

  play = jest.fn(async (_url: string) =>
    this.emit({ status: 'playing', position: 0, duration: 2 }),
  );
  pause = jest.fn(() => this.emit({ status: 'paused', position: 1, duration: 2 }));
  stop = jest.fn();
  release = jest.fn();

  subscribe(listener: (state: PlaybackState) => void) {
    this.listener = listener;
    return () => {
      this.listener = null;
    };
  }

  emit(state: PlaybackState) {
    this.listener?.(state);
  }
}

/** SpeechService that resolves immediately. */
export class FakeSpeechService implements SpeechService {
  speak = jest.fn(async (_text: string) => {});
  stop = jest.fn();
}
