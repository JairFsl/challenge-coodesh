import { getPronunciationAudio } from '@/domain/entities';

import { dictionaryResponseSchema } from '../../dtos/dictionaryApi';
import { toWordDefinition } from '../wordDefinitionMapper';

const apiResponse = [
  {
    word: 'hello',
    phonetics: [
      { audio: 'https://audio/hello-au.mp3' },
      { text: '/həˈləʊ/', audio: 'https://audio/hello-uk.mp3' },
      { text: '/həˈloʊ/', audio: '' },
    ],
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [{ definition: '"Hello!" or an equivalent greeting.' }],
        synonyms: ['greeting'],
      },
    ],
    sourceUrls: ['https://en.wiktionary.org/wiki/hello'],
  },
  {
    word: 'hello',
    phonetic: '/həˈləʊ/',
    phonetics: [{ text: '/həˈləʊ/', audio: 'https://audio/hello-uk.mp3' }],
    meanings: [{ partOfSpeech: 'verb', definitions: [{ definition: 'To greet with "hello".' }] }],
    sourceUrls: ['https://en.wiktionary.org/wiki/hello'],
  },
];

describe('toWordDefinition', () => {
  const definition = toWordDefinition(dictionaryResponseSchema.parse(apiResponse));

  it('merges the meanings of every entry', () => {
    expect(definition.meanings.map(meaning => meaning.partOfSpeech)).toEqual(['noun', 'verb']);
    expect(definition.meanings[1].definitions[0]).toEqual({
      definition: 'To greet with "hello".',
      synonyms: [],
      antonyms: [],
    });
  });

  it('deduplicates phonetics and treats empty audio as missing', () => {
    expect(definition.phonetics).toEqual([
      { text: undefined, audioUrl: 'https://audio/hello-au.mp3' },
      { text: '/həˈləʊ/', audioUrl: 'https://audio/hello-uk.mp3' },
      { text: '/həˈloʊ/', audioUrl: undefined },
    ]);
    expect(definition.sourceUrls).toEqual(['https://en.wiktionary.org/wiki/hello']);
  });

  it('uses the explicit phonetic or falls back to the first phonetic text', () => {
    expect(definition.phonetic).toBe('/həˈləʊ/');
    expect(toWordDefinition([{ ...dictionaryResponseSchema.parse(apiResponse)[0] }]).phonetic).toBe(
      '/həˈləʊ/',
    );
  });

  it('exposes the first recorded pronunciation', () => {
    expect(getPronunciationAudio(definition)).toBe('https://audio/hello-au.mp3');
  });
});
