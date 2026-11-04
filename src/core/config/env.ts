import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@env';
import { z } from 'zod';

const envSchema = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

/** Validates the `.env` variables and fails fast with the names of the invalid ones. */
function loadEnv(): Env {
  const result = envSchema.safeParse({ SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY });
  if (!result.success) {
    const missing = result.error.issues.map(issue => issue.path.join('.')).join(', ');
    throw new Error(`Invalid environment variables: ${missing}. Check your .env file.`);
  }
  return result.data;
}

export const env = loadEnv();
