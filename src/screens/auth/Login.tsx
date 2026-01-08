// src/screens/auth/Login.tsx
import React, { useState } from 'react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button/Button';
import { useAuth } from '../../auth/AuthContext';
import { login as loginApi } from '../../api/authClient';

type Mode = 'login' | 'forgot';

export function Login({ onSwitch }: { onSwitch: () => void }) {
  const { login } = useAuth();

  const [mode, setMode] = useState<Mode>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const data = await loginApi(email, password);
      await login(data.access_token);
    } catch (e) {
      setError('Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const res = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      // Даже если email не существует, лучше показывать одинаковое сообщение (не палим наличие аккаунта). [web:307]
      if (!res.ok) {
        // если бэк вернёт текст/JSON — покажем как есть
        let msg = 'Не удалось отправить ссылку';
        try {
          const data = await res.json();
          msg = data?.detail ?? msg;
        } catch {
          try {
            msg = await res.text();
          } catch {}
        }
        setError(msg);
        return;
      }

      setInfo('Если этот email существует, на него отправлена ссылка для сброса пароля.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark center-vertical px-4">
      <div className="max-w-390 w-full space-y-6">
        <h1 className="page__title text-center">
          {mode === 'login' ? 'Вход' : 'Восстановление пароля'}
        </h1>

        {error && <div className="text-red-500 text-center">{error}</div>}
        {info && <div className="text-green-500 text-center">{info}</div>}

        <Input label="Email" value={email} onChange={setEmail} />

        {mode === 'login' && (
          <>
            <Input label="Пароль" type="password" value={password} onChange={setPassword} />

            <Button onClick={handleLogin} variant="primary" size="large" fullWidth disabled={loading}>
              {loading ? 'Входим...' : 'Войти'}
            </Button>

            <button
              onClick={() => {
                setMode('forgot');
                setError(null);
                setInfo(null);
              }}
              className="text-sm text-accent text-center w-full"
              type="button"
            >
              Забыли пароль?
            </button>

            <button onClick={onSwitch} className="text-sm text-accent text-center w-full" type="button">
              Нет аккаунта? Зарегистрироваться
            </button>
          </>
        )}

        {mode === 'forgot' && (
          <>
            <Button onClick={handleForgot} variant="primary" size="large" fullWidth disabled={loading}>
              {loading ? 'Отправляем...' : 'Отправить ссылку'}
            </Button>

            <button
              onClick={() => {
                setMode('login');
                setError(null);
                setInfo(null);
              }}
              className="text-sm text-accent text-center w-full"
              type="button"
            >
              Вернуться ко входу
            </button>
          </>
        )}
      </div>
    </div>
  );
}
