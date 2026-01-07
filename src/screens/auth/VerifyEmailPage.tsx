import React, { useEffect, useState } from 'react';

export function VerifyEmailPage({ token }: { token: string }) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');

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

  if (status === 'loading') return <div>Проверяем токен…</div>;
  if (status === 'ok') return <div>Email подтверждён. Можно войти.</div>;
  return <div>Неверный или истёкший токен.</div>;
}
