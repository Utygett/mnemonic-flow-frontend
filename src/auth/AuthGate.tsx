import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Login } from '../screens/Auth/Login';
import { Register } from '../screens/Auth/Register';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  if (!token) {
    return mode === 'login' ? (
      <Login onSwitch={() => setMode('register')} />
    ) : (
      <Register onSwitch={() => setMode('login')} />
    );
  }

  return <>{children}</>;
}
