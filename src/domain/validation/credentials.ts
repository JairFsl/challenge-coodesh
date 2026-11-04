import { z } from 'zod';

import { ValidationError } from '@/core/errors';

import type { Credentials } from '../entities';

const PASSWORD_MIN_LENGTH = 6;

export type CredentialsErrorCode = 'email_required' | 'email_invalid' | 'password_too_short';

export type CredentialsErrors = Partial<Record<keyof Credentials, CredentialsErrorCode>>;

const emailSchema = z.email();

/** Normalizes the e-mail (trim + lowercase) keeping the password untouched. */
export function normalizeCredentials({ email, password }: Credentials): Credentials {
  return { email: email.trim().toLowerCase(), password };
}

/** Returns the error code of each invalid field (empty object when valid). */
export function validateCredentials({ email, password }: Credentials): CredentialsErrors {
  const errors: CredentialsErrors = {};
  if (!email) {
    errors.email = 'email_required';
  } else if (!emailSchema.safeParse(email).success) {
    errors.email = 'email_invalid';
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.password = 'password_too_short';
  }
  return errors;
}

/** Normalizes and validates the credentials. @throws ValidationError with the invalid fields */
export function assertValidCredentials(credentials: Credentials): Credentials {
  const normalized = normalizeCredentials(credentials);
  const errors = validateCredentials(normalized);
  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
  return normalized;
}
