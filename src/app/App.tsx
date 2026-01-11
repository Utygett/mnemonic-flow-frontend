import React from 'react';

import { AuthProvider } from './providers/auth/AuthContext';
import { AuthGate } from './providers/auth/AuthGate';

import { AppRouter } from './AppRouter';
import { MainShellContainer } from '../widgets/main-shell';

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
