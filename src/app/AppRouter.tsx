// src/app/AppRouter.tsx
import React from 'react';

import { ResetPasswordPage } from '../screens/auth/ResetPasswordPage';
import { VerifyEmailPage } from '../screens/auth/VerifyEmailPage';

type AppRouterProps = {
  renderMain: () => React.ReactNode;
};

function getPathRoute() {
  const path = window.location.pathname || '/';
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') || '';
  return { path, token };
}

export function AppRouter(props: AppRouterProps) {
  const { path, token } = getPathRoute();

  if (path === '/reset-password') {
    return <ResetPasswordPage token={token} />;
  }

  if (path === '/verify-email') {
    return <VerifyEmailPage token={token} />;
  }

  return <>{props.renderMain()}</>;
}
