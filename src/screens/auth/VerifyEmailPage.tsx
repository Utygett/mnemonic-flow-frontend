import React, { useEffect, useState } from 'react';

export function VerifyEmailPage({ token }: { token: string }) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [secondsLeft, setSecondsLeft] = useState(5);

  // 1) проверка токена
  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => setStatus(res.ok ? 'ok' : 'error'))
      .catch(() => setStatus('error'));
  }, [token]);

  // 2) редирект через 5 секунд после успеха
  useEffect(() => {
    if (status !== 'ok') return;

    setSecondsLeft(5);

    const intervalId = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    const timeoutId = window.setTimeout(() => {
      // сюда поставь hash-роут твоего экрана логина/регистрации
      // если вход по умолчанию на "#/" — оставь так:
      window.location.hash = '/';
    }, 5000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [status]);

  if (status === 'loading') return <div>Проверяем токен…</div>;

  if (status === 'error') return (
    <div>
      Неверный или истёкший токен. <a href="/">Перейти ко входу</a>
    </div>
  );

  // status === 'ok'
  return (
    <div>
      <div>Email подтверждён. Перенаправление на вход через {secondsLeft} сек…</div>
      <a href="/">Перейти на вход сейчас</a>
    </div>
  );
}
