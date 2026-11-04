import Speech from '@mhpdev/react-native-speech';
import { injectable } from 'tsyringe';

import { SPEECH_LANGUAGE, SPEECH_TIMEOUT_MS } from '@/core/config/constants';
import { AppError } from '@/core/errors';
import type { SpeechService } from '@/domain/services';

@injectable()
export class NativeSpeechService implements SpeechService {
  private finishPending: ((error?: AppError) => void) | null = null;

  constructor() {
    Speech.onFinish(() => this.finishPending?.());
    Speech.onError(() => this.finishPending?.(new AppError('Text-to-speech failed')));
  }

  /**
   * Speaks the text with the native TTS engine and resolves when it finishes, is stopped or
   * exceeds the timeout (some engines never report the end of the utterance).
   */
  speak(text: string): Promise<void> {
    this.stop();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => this.finishPending?.(), SPEECH_TIMEOUT_MS);
      this.finishPending = error => {
        clearTimeout(timeout);
        this.finishPending = null;
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      };
      Speech.speak(text, { language: SPEECH_LANGUAGE }).catch(error =>
        this.finishPending?.(new AppError('Text-to-speech failed', error)),
      );
    });
  }

  /** Interrupts the current utterance, resolving its pending promise. */
  stop(): void {
    this.finishPending?.();
    Speech.stop();
  }
}
