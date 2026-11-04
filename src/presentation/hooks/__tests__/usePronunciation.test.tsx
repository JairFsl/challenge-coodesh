import { act, renderHook } from '@testing-library/react-native';
import { container } from 'tsyringe';

import { NetworkError } from '@/core/errors';
import { TOKENS } from '@/di/tokens';
import { FakeAudioPlayer, FakeSpeechService } from '@/test/fakes/FakeMediaServices';
import { TestProviders } from '@/test/TestProviders';

import { usePronunciation } from '../usePronunciation';

describe('usePronunciation', () => {
  let audioPlayer: FakeAudioPlayer;
  let speech: FakeSpeechService;

  beforeEach(() => {
    audioPlayer = new FakeAudioPlayer();
    speech = new FakeSpeechService();
    container.registerInstance(TOKENS.AudioPlayer, audioPlayer);
    container.registerInstance(TOKENS.SpeechService, speech);
  });

  afterEach(() => container.clearInstances());

  it('plays the recorded pronunciation and pauses it on the next toggle', async () => {
    const { result } = await renderHook(
      () => usePronunciation('hello', 'https://audio/hello.mp3'),
      {
        wrapper: TestProviders,
      },
    );

    expect(result.current.source).toBe('recording');
    await act(() => result.current.toggle());
    expect(audioPlayer.play).toHaveBeenCalledWith('https://audio/hello.mp3');
    expect(result.current.isPlaying).toBe(true);

    await act(() => result.current.toggle());
    expect(audioPlayer.pause).toHaveBeenCalled();
  });

  it('reports the playback progress', async () => {
    const { result } = await renderHook(
      () => usePronunciation('hello', 'https://audio/hello.mp3'),
      {
        wrapper: TestProviders,
      },
    );

    await act(async () => audioPlayer.emit({ status: 'playing', position: 1, duration: 4 }));

    expect(result.current.progress).toBe(0.25);
  });

  it('speaks the word with TTS when there is no recording', async () => {
    const { result } = await renderHook(() => usePronunciation('aah'), { wrapper: TestProviders });

    expect(result.current.source).toBe('speech');
    await act(() => result.current.toggle());

    expect(speech.speak).toHaveBeenCalledWith('aah');
    expect(audioPlayer.play).not.toHaveBeenCalled();
  });

  it('falls back to TTS when the recording cannot be loaded', async () => {
    audioPlayer.play.mockRejectedValueOnce(new NetworkError('502'));
    const { result } = await renderHook(
      () => usePronunciation('hello', 'https://audio/hello.mp3'),
      {
        wrapper: TestProviders,
      },
    );

    await act(() => result.current.toggle());

    expect(speech.speak).toHaveBeenCalledWith('hello');
    expect(result.current.source).toBe('speech');
  });

  it('releases the player when the word changes', async () => {
    const { rerender } = await renderHook(({ word }: { word: string }) => usePronunciation(word), {
      wrapper: TestProviders,
      initialProps: { word: 'hello' },
    });

    await rerender({ word: 'world' });

    expect(audioPlayer.release).toHaveBeenCalled();
    expect(speech.stop).toHaveBeenCalled();
  });
});
