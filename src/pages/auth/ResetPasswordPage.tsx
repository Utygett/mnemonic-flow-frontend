import React, { useEffect, useState } from 'react';

export function ResetPasswordPage({ token }: { token: string }) {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus('idle');

    if (!token) {
      setStatus('error');
      setError('Токен не найден в ссылке');
      return;
    }

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: password }),
    });

    if (!res.ok) {
      let msg = 'Ошибка';
      try {
        msg = (await res.json()).detail ?? msg;
      } catch {}
      setError(msg);
      setStatus('error');
      return;
    }

    setStatus('ok');
  };

  useEffect(() => {
    if (status !== 'ok') return;

    setSecondsLeft(5);

    const intervalId = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    const timeoutId = window.setTimeout(() => {
      window.location.hash = '/';
    }, 5000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [status]);

  if (!token) return <div>Токен не найден в ссылке</div>;

  if (status === 'ok') {
    return (
      <div>
        <div>Пароль изменён. Перенаправление на вход через {secondsLeft} сек…</div>
        <a href="/">Перейти на вход сейчас</a>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <h1>Новый пароль</h1>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Введите новый пароль"
        required
      />
      <button type="submit">Сохранить</button>
      {error && <div>{error}</div>}
    </form>
  );
}
