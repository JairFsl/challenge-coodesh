/**
 * Seeds `public.words` with the dwyl/english-words list.
 *
 * Usage: yarn seed:words   (reads SUPABASE_URL and SUPABASE_SECRET_KEY from .env)
 *
 * Idempotent: duplicated words are ignored, so it can be re-run safely.
 */

const SOURCE_URL =
  'https://raw.githubusercontent.com/dwyl/english-words/master/words_dictionary.json';
const BATCH_SIZE = 5000;
const MAX_WORD_LENGTH = 64;
const MAX_RETRIES = 3;

const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env');
  process.exit(1);
}

const headers = {
  apikey: SUPABASE_SECRET_KEY,
  'Content-Type': 'application/json',
  Prefer: 'resolution=ignore-duplicates,return=minimal',
  // Legacy service_role keys are JWTs and must also be sent as a Bearer token
  ...(SUPABASE_SECRET_KEY.startsWith('eyJ') && {
    Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
  }),
};

async function fetchWords() {
  const response = await fetch(SOURCE_URL);
  if (!response.ok) {
    throw new Error(`Failed to download word list: HTTP ${response.status}`);
  }
  const dictionary = await response.json();
  return Object.keys(dictionary)
    .map(word => word.trim().toLowerCase())
    .filter(word => word.length > 0 && word.length <= MAX_WORD_LENGTH)
    .sort();
}

async function insertBatch(words, attempt = 1) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/words?on_conflict=word`, {
    method: 'POST',
    headers,
    body: JSON.stringify(words.map(word => ({ word }))),
  });
  if (response.ok) {
    return;
  }
  if (attempt < MAX_RETRIES) {
    await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    return insertBatch(words, attempt + 1);
  }
  throw new Error(`HTTP ${response.status}: ${await response.text()}`);
}

async function main() {
  console.log('Downloading word list...');
  const words = await fetchWords();
  console.log(`${words.length} words to insert`);

  for (let start = 0; start < words.length; start += BATCH_SIZE) {
    await insertBatch(words.slice(start, start + BATCH_SIZE));
    const done = Math.min(start + BATCH_SIZE, words.length);
    process.stdout.write(`\rInserted ${done}/${words.length}`);
  }
  console.log('\nDone!');
}

main().catch(error => {
  console.error('\nSeed failed:', error.message);
  process.exit(1);
});
