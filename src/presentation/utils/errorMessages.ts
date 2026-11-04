import { AuthError, NetworkError, type AuthErrorCode } from '@/core/errors';
import type { CredentialsErrorCode } from '@/domain/validation/credentials';

const AUTH_MESSAGES: Record<AuthErrorCode, string> = {
  invalid_credentials: 'E-mail ou senha incorretos.',
  email_taken: 'Já existe uma conta com este e-mail.',
  weak_password: 'A senha deve ter pelo menos 6 caracteres.',
  invalid_email: 'Informe um e-mail válido.',
  rate_limited: 'Muitas tentativas. Aguarde um instante e tente novamente.',
  unknown: 'Não foi possível concluir. Tente novamente.',
};

const FIELD_MESSAGES: Record<CredentialsErrorCode, string> = {
  email_required: 'Informe seu e-mail.',
  email_invalid: 'Informe um e-mail válido.',
  password_too_short: 'A senha deve ter pelo menos 6 caracteres.',
};

const NETWORK_MESSAGE = 'Sem conexão com a internet. Verifique sua rede e tente novamente.';
const GENERIC_MESSAGE = 'Algo deu errado. Tente novamente.';

/** Returns a user-friendly message for any error thrown by the app. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof NetworkError) {
    return NETWORK_MESSAGE;
  }
  if (error instanceof AuthError) {
    return AUTH_MESSAGES[error.code];
  }
  return GENERIC_MESSAGE;
}

/** Returns the message of a credentials validation error code. */
export function getFieldErrorMessage(code: string | undefined): string | undefined {
  return code ? FIELD_MESSAGES[code as CredentialsErrorCode] : undefined;
}
