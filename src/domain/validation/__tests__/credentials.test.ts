import { ValidationError } from '@/core/errors';

import { assertValidCredentials, validateCredentials } from '../credentials';

describe('validateCredentials', () => {
  it('accepts a valid e-mail and a password with at least 6 characters', () => {
    expect(validateCredentials({ email: 'ana@mail.com', password: '123456' })).toEqual({});
  });

  it('requires the e-mail', () => {
    expect(validateCredentials({ email: '', password: '123456' })).toEqual({
      email: 'email_required',
    });
  });

  it('rejects malformed e-mails and short passwords', () => {
    expect(validateCredentials({ email: 'ana@', password: '123' })).toEqual({
      email: 'email_invalid',
      password: 'password_too_short',
    });
  });
});

describe('assertValidCredentials', () => {
  it('normalizes the e-mail without touching the password', () => {
    expect(assertValidCredentials({ email: '  Ana@Mail.COM ', password: ' Secret1' })).toEqual({
      email: 'ana@mail.com',
      password: ' Secret1',
    });
  });

  it('throws a ValidationError listing the invalid fields', () => {
    expect(() => assertValidCredentials({ email: '', password: '' })).toThrow(ValidationError);
  });
});
