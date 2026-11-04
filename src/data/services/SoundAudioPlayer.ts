import Sound from 'react-native-sound';
import { injectable } from 'tsyringe';

import { AUDIO_LOAD_TIMEOUT_MS, AUDIO_PROGRESS_INTERVAL_MS } from '@/core/config/constants';
import { NetworkError } from '@/core/errors';
import type { AudioPlayer, PlaybackState } from '@/domain/services';

const IDLE_STATE: PlaybackState = { status: 'idle', position: 0, duration: 0 };

@injectable()
export class SoundAudioPlayer implements AudioPlayer {
  private sound: Sound | null = null;
  private url: string | null = null;
  private state: PlaybackState = IDLE_STATE;
  private progressTimer: ReturnType<typeof setInterval> | null = null;
  private readonly listeners = new Set<(state: PlaybackState) => void>();

  constructor() {
    Sound.setCategory('Playback');
  }

  /** Loads the remote file on the first call for a URL and resumes it on the next ones. */
  async play(url: string): Promise<void> {
    if (this.sound && this.url === url) {
      this.start(this.sound);
      return;
    }

    this.release();
    this.url = url;
    this.setState({ status: 'loading', position: 0, duration: 0 });

    const sound = await this.load(url).catch(error => {
      if (this.url === url) {
        this.url = null;
        this.setState({ ...IDLE_STATE, status: 'error' });
      }
      throw error;
    });

    if (this.url !== url) {
      sound.release();
      return;
    }
    this.sound = sound;
    this.start(sound);
  }

  /** Pauses keeping the current position. */
  pause(): void {
    this.sound?.pause();
    this.stopProgress();
    this.setState({ ...this.state, status: 'paused' });
  }

  /** Stops and rewinds to the beginning. */
  stop(): void {
    this.sound?.stop();
    this.stopProgress();
    this.setState({ ...this.state, status: 'idle', position: 0 });
  }

  /** Releases the native player of the current URL. */
  release(): void {
    this.stopProgress();
    this.sound?.release();
    this.sound = null;
    this.url = null;
    this.setState(IDLE_STATE);
  }

  /** Notifies playback status and position changes. */
  subscribe(listener: (state: PlaybackState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private load(url: string): Promise<Sound> {
    return new Promise((resolve, reject) => {
      let settled = false;
      const timeout = setTimeout(() => {
        settled = true;
        reject(new NetworkError('Timed out loading the pronunciation audio'));
      }, AUDIO_LOAD_TIMEOUT_MS);

      const instance = new Sound(url, error => {
        clearTimeout(timeout);
        if (settled) {
          instance.release();
          return;
        }
        settled = true;
        if (error) {
          instance.release();
          reject(new NetworkError('Could not load the pronunciation audio', error));
        } else {
          resolve(instance);
        }
      });
    });
  }

  private start(sound: Sound): void {
    this.setState({ ...this.state, status: 'playing', duration: sound.getDuration() });
    this.startProgress(sound);
    sound.play(success => {
      this.stopProgress();
      this.setState({ ...this.state, status: success ? 'idle' : 'error', position: 0 });
    });
  }

  private startProgress(sound: Sound): void {
    this.stopProgress();
    this.progressTimer = setInterval(() => {
      sound.getCurrentTime(seconds => {
        if (this.state.status === 'playing') {
          this.setState({ ...this.state, position: seconds });
        }
      });
    }, AUDIO_PROGRESS_INTERVAL_MS);
  }

  private stopProgress(): void {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  private setState(state: PlaybackState): void {
    this.state = state;
    this.listeners.forEach(listener => listener(state));
  }
}
