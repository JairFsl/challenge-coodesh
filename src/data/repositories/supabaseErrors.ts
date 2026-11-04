import type { PostgrestError } from '@supabase/supabase-js';

import { AppError, NetworkError } from '@/core/errors';

/**
 * PostgREST reports fetch failures (offline, timeout, aborted request) with an empty
 * `code`, while database/API errors always carry one (e.g. `PGRST301`, `42501`).
 */
export function toDomainError(error: PostgrestError): AppError {
  if (!error.code) {
    return new NetworkError(error.message, error);
  }
  return new AppError(`Database request failed (${error.code}): ${error.message}`, error);
}
