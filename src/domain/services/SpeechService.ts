export interface SpeechService {
  speak(text: string): Promise<void>;
  stop(): void;
}
