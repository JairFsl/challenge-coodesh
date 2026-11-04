export class AppError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = new.target.name;
  }
}

export class NetworkError extends AppError {}

export class WordNotFoundError extends AppError {
  constructor(readonly word: string) {
    super(`No definitions found for "${word}"`);
  }
}

export type AuthErrorCode =
  | 'invalid_credentials'
  | 'email_taken'
  | 'weak_password'
  | 'invalid_email'
  | 'rate_limited'
  | 'unknown';

export class AuthError extends AppError {
  constructor(readonly code: AuthErrorCode, cause?: unknown) {
    super(`Authentication failed: ${code}`, cause);
  }
}

export class ValidationError<TField extends string = string> extends AppError {
  constructor(readonly fields: Partial<Record<TField, string>>) {
    super(`Invalid fields: ${Object.keys(fields).join(', ')}`);
  }
}

export class InvalidResponseError extends AppError {}
