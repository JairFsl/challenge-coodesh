import type { Phonetic, WordDefinition } from '@/domain/entities';

import type { DictionaryEntryDto } from '../dtos/dictionaryApi';

/** Merges every API entry of a word into a single definition (phonetics deduplicated). */
export function toWordDefinition(entries: DictionaryEntryDto[]): WordDefinition {
  const phonetics = uniqueBy(
    entries
      .flatMap(entry => entry.phonetics)
      .map(
        ({ text, audio }): Phonetic => ({ text: text || undefined, audioUrl: audio || undefined }),
      )
      .filter(phonetic => Boolean(phonetic.text || phonetic.audioUrl)),
    phonetic => `${phonetic.text}|${phonetic.audioUrl}`,
  );

  return {
    word: entries[0].word,
    phonetic: entries.find(entry => entry.phonetic)?.phonetic ?? phonetics.find(p => p.text)?.text,
    phonetics,
    meanings: entries.flatMap(entry => entry.meanings),
    sourceUrls: [...new Set(entries.flatMap(entry => entry.sourceUrls))],
  };
}

function uniqueBy<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const value = key(item);
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}
