import { AxiosError, AxiosHeaders, type AxiosInstance } from 'axios';

import { InvalidResponseError, NetworkError, WordNotFoundError } from '@/core/errors';

import { DictionaryApiRepository } from '../DictionaryApiRepository';

function createRepository(get: jest.Mock) {
  return new DictionaryApiRepository({ get } as unknown as AxiosInstance);
}

function axiosError(status?: number) {
  const config = { headers: new AxiosHeaders() };
  const response = status ? { status, statusText: '', headers: {}, config, data: {} } : undefined;
  return new AxiosError('Request failed', 'ERR', config, {}, response);
}

describe('DictionaryApiRepository', () => {
  it('requests the encoded word and maps the response', async () => {
    const get = jest.fn().mockResolvedValue({
      data: [
        { word: 'hello', phonetics: [], meanings: [{ partOfSpeech: 'noun', definitions: [] }] },
      ],
    });
    const controller = new AbortController();

    const definition = await createRepository(get).getDefinition('hello', controller.signal);

    expect(get).toHaveBeenCalledWith('/hello', { signal: controller.signal });
    expect(definition.word).toBe('hello');
  });

  it('throws WordNotFoundError when the API answers 404', async () => {
    const get = jest.fn().mockRejectedValue(axiosError(404));

    await expect(createRepository(get).getDefinition('aah')).rejects.toBeInstanceOf(
      WordNotFoundError,
    );
  });

  it('throws NetworkError when there is no response (offline or timeout)', async () => {
    const get = jest.fn().mockRejectedValue(axiosError());

    await expect(createRepository(get).getDefinition('hello')).rejects.toBeInstanceOf(NetworkError);
  });

  it('rejects responses that do not match the expected contract', async () => {
    const get = jest.fn().mockResolvedValue({ data: { title: 'unexpected' } });

    await expect(createRepository(get).getDefinition('hello')).rejects.toBeInstanceOf(
      InvalidResponseError,
    );
  });
});
