export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface PlaybackState {
  status: PlaybackStatus;
  position: number;
  duration: number;
}

export interface AudioPlayer {
  /** Loads (if needed) and plays the audio at `url`. */
  play(url: string): Promise<void>;
  pause(): void;
  stop(): void;
  /** Releases native resources. */
  release(): void;
  subscribe(listener: (state: PlaybackState) => void): () => void;
}
