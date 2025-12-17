import React, { useState } from 'react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button/Button';
import { useAuth } from '../../auth/AuthContext';

export function Register({ onSwitch }: { onSwitch: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    // ⚠️ временно
    login('mock-token');
  };

  return (
    <div className="min-h-screen bg-dark center-vertical px-4">
      <div className="max-w-390 w-full space-y-6">
        <h1 className="page__title text-center">Регистрация</h1>

        <Input label="Email" value={email} onChange={setEmail} />
        <Input
          label="Пароль"
          type="password"
          value={password}
          onChange={setPassword}
        />

        <Button onClick={handleSubmit} variant="primary" size="large" fullWidth>
          Создать аккаунт
        </Button>

        <button
          onClick={onSwitch}
          className="text-sm text-accent text-center w-full"
        >
          Уже есть аккаунт? Войти
        </button>
      </div>
    </div>
  );
}
