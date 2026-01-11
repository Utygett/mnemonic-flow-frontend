import React from 'react';

import { AuthProvider } from './app/providers/auth/AuthContext';
import { AuthGate } from './app/providers/auth/AuthGate';

import { AppRouter } from './app/AppRouter';
import { MainShellContainer } from './widgets/main-shell';

export default function App() {
  return (
    <AuthProvider>
      <AppRouter
        renderMain={() => (
          <AuthGate>
            <MainShellContainer />
          </AuthGate>
        )}
      />
    </AuthProvider>
  );
}
