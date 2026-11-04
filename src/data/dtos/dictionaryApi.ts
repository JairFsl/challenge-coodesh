import { z } from 'zod';

const phoneticSchema = z.object({
  text: z.string().optional(),
  audio: z.string().optional(),
});

const definitionSchema = z.object({
  definition: z.string(),
  example: z.string().optional(),
  synonyms: z.array(z.string()).default([]),
  antonyms: z.array(z.string()).default([]),
});

const meaningSchema = z.object({
  partOfSpeech: z.string(),
  definitions: z.array(definitionSchema).default([]),
  synonyms: z.array(z.string()).default([]),
  antonyms: z.array(z.string()).default([]),
});

const entrySchema = z.object({
  word: z.string(),
  phonetic: z.string().optional(),
  phonetics: z.array(phoneticSchema).default([]),
  meanings: z.array(meaningSchema).default([]),
  sourceUrls: z.array(z.string()).default([]),
});

export const dictionaryResponseSchema = z.array(entrySchema).min(1);

export type DictionaryEntryDto = z.infer<typeof entrySchema>;
