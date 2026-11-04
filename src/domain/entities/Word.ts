export interface Phonetic {
  text?: string;
  audioUrl?: string;
}

export interface Definition {
  definition: string;
  example?: string;
  synonyms: string[];
  antonyms: string[];
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
}

export interface WordDefinition {
  word: string;
  phonetic?: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  sourceUrls: string[];
}

export interface WordPage {
  words: string[];
  nextCursor: string | null;
}

/** Returns the first recorded pronunciation of the word, if any. */
export function getPronunciationAudio(definition: WordDefinition): string | undefined {
  return definition.phonetics.find(phonetic => phonetic.audioUrl)?.audioUrl;
}
