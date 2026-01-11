import React from 'react';

import { AuthProvider } from './auth/AuthContext';
import { AuthGate } from './auth/AuthGate';

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
