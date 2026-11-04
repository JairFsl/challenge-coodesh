import { render, screen, userEvent } from '@testing-library/react-native';
import React from 'react';
import { container } from 'tsyringe';

import { AuthError } from '@/core/errors';
import { TOKENS } from '@/di/tokens';
import { FakeAuthRepository } from '@/test/fakes/FakeAuthRepository';
import { TestProviders } from '@/test/TestProviders';

import { SignInScreen } from '../SignInScreen';

type Props = React.ComponentProps<typeof SignInScreen>;

describe('SignInScreen', () => {
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

  async function renderScreen() {
    await render(
      <SignInScreen
        navigation={navigation as unknown as Props['navigation']}
        route={{ key: 'SignIn', name: 'SignIn' }}
      />,
      { wrapper: TestProviders },
    );
  }

  it('shows field errors without calling the backend', async () => {
    const user = userEvent.setup();
    await renderScreen();

    await user.press(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Informe seu e-mail.')).toBeOnTheScreen();
    expect(screen.getByText('A senha deve ter pelo menos 6 caracteres.')).toBeOnTheScreen();
    expect(authRepository.signIn).not.toHaveBeenCalled();
  });

  it('signs in with the normalized e-mail', async () => {
    const user = userEvent.setup();
    await renderScreen();

    await user.type(screen.getByLabelText('E-mail'), 'Ana@Mail.com');
    await user.type(screen.getByLabelText('Senha'), '123456');
    await user.press(screen.getByRole('button', { name: 'Entrar' }));

    expect(authRepository.signIn).toHaveBeenCalledWith({
      email: 'ana@mail.com',
      password: '123456',
    });
  });

  it('shows a friendly message for wrong credentials', async () => {
    authRepository.signIn.mockRejectedValueOnce(new AuthError('invalid_credentials'));
    const user = userEvent.setup();
    await renderScreen();

    await user.type(screen.getByLabelText('E-mail'), 'ana@mail.com');
    await user.type(screen.getByLabelText('Senha'), 'wrong-pass');
    await user.press(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos.');
  });

  it('switches to the sign up screen', async () => {
    const user = userEvent.setup();
    await renderScreen();

    await user.press(screen.getByRole('button', { name: 'Não tem conta? Criar conta' }));

    expect(navigation.replace).toHaveBeenCalledWith('SignUp');
  });
});
