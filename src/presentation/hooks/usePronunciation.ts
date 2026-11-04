import { useCallback, useEffect, useState } from 'react';

import { TOKENS } from '@/di/tokens';
import type { AudioPlayer, PlaybackState, SpeechService } from '@/domain/services';

import { useDependency } from './useDependency';
import { useIsOnline } from './useIsOnline';

export type PronunciationSource = 'recording' | 'speech';

const IDLE_PLAYBACK: PlaybackState = { status: 'idle', position: 0, duration: 0 };

/** Plays the recorded pronunciation when available and online, falling back to native TTS. */
export function usePronunciation(word: string, audioUrl?: string) {
  const audioPlayer = useDependency<AudioPlayer>(TOKENS.AudioPlayer);
  const speech = useDependency<SpeechService>(TOKENS.SpeechService);
  const isOnline = useIsOnline();
  const [playback, setPlayback] = useState(IDLE_PLAYBACK);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recordingFailed, setRecordingFailed] = useState(false);

  const source: PronunciationSource =
    audioUrl && isOnline && !recordingFailed ? 'recording' : 'speech';

  useEffect(() => audioPlayer.subscribe(setPlayback), [audioPlayer]);

  useEffect(() => {
    setRecordingFailed(false);
    return () => {
      audioPlayer.release();
      speech.stop();
    };
  }, [word, audioPlayer, speech]);

  const speak = useCallback(async () => {
    setIsSpeaking(true);
    try {
      await speech.speak(word);
    } catch {
      return;
    } finally {
      setIsSpeaking(false);
    }
  }, [speech, word]);

  const toggle = useCallback(async () => {
    if (source === 'speech') {
      return isSpeaking ? speech.stop() : speak();
    }
    if (playback.status === 'playing') {
      return audioPlayer.pause();
    }
    try {
      await audioPlayer.play(audioUrl!);
    } catch {
      setRecordingFailed(true);
      await speak();
    }
  }, [source, isSpeaking, speech, speak, playback.status, audioPlayer, audioUrl]);

  const isRecording = source === 'recording';
  return {
    source,
    toggle,
    isPlaying: isRecording ? playback.status === 'playing' : isSpeaking,
    isLoading: isRecording && playback.status === 'loading',
    progress: isRecording && playback.duration > 0 ? playback.position / playback.duration : 0,
  };
}
