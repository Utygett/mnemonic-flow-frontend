import React, { useState } from 'react';

export function ResetPasswordPage({ token }: { token: string }) {
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: password }),
    });

    if (!res.ok) {
      let msg = 'Ошибка';
      try { msg = (await res.json()).detail ?? msg; } catch {}
      setError(msg);
      return;
    }
    setDone(true);
  };

  if (!token) return <div>Токен не найден в ссылке</div>;
  if (done) return <div>Пароль изменён. Можно войти.</div>;

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
