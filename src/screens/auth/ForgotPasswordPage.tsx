import React, { useState } from 'react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await fetch('/api/auth/request-password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      setError(await res.text());
      return;
    }
    setDone(true);
  };

  if (done) return <div>Если email существует — ссылка для сброса отправлена.</div>;

  return (
    <form onSubmit={submit}>
      <h1>Восстановление пароля</h1>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <button type="submit">Отправить ссылку</button>
      {error && <div>{error}</div>}
    </form>
  );
}
