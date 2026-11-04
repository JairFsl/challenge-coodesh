import { render, screen, userEvent } from '@testing-library/react-native';
import React from 'react';
import { container } from 'tsyringe';

import { AuthError, NetworkError } from '@/core/errors';
import { TOKENS } from '@/di/tokens';
import { FakeAuthRepository } from '@/test/fakes/FakeAuthRepository';
import { TestProviders } from '@/test/TestProviders';

import { SignUpScreen } from '../SignUpScreen';

type Props = React.ComponentProps<typeof SignUpScreen>;

describe('SignUpScreen', () => {
  let authRepository: FakeAuthRepository;
  const navigation = { replace: jest.fn() };

  beforeEach(() => {
    authRepository = new FakeAuthRepository();
    container.registerInstance(TOKENS.AuthRepository, authRepository);
  });

  afterEach(() => {
    container.clearInstances();
    jest.clearAllMocks();
  });

  async function fillAndSubmit() {
    const user = userEvent.setup();
    await render(
      <SignUpScreen
        navigation={navigation as unknown as Props['navigation']}
        route={{ key: 'SignUp', name: 'SignUp' }}
      />,
      { wrapper: TestProviders },
    );
    await user.type(screen.getByLabelText('E-mail'), 'ana@mail.com');
    await user.type(screen.getByLabelText('Senha'), '123456');
    await user.press(screen.getByRole('button', { name: 'Criar conta' }));
  }

  it('creates the account with the typed credentials', async () => {
    await fillAndSubmit();

    expect(authRepository.signUp).toHaveBeenCalledWith({
      email: 'ana@mail.com',
      password: '123456',
    });
  });

  it('tells the user when the e-mail is already registered', async () => {
    authRepository.signUp.mockRejectedValueOnce(new AuthError('email_taken'));

    await fillAndSubmit();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Já existe uma conta com este e-mail.',
    );
  });

  it('tells the user when there is no connection', async () => {
    authRepository.signUp.mockRejectedValueOnce(new NetworkError('offline'));

    await fillAndSubmit();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Sem conexão com a internet. Verifique sua rede e tente novamente.',
    );
  });
});
