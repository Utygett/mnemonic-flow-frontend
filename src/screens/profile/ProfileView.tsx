import React from 'react';
import type { ProfileViewProps } from './profile.types';

export function ProfileView(props: ProfileViewProps) {
  const { apiHealth, isPWA } = props;

  return (
    <div className="min-h-screen bg-dark pb-24">
      <div className="page__header px-4 pt-12 pb-6">
        <div className="page__header-inner">
          <h1 className="page__title">Профиль</h1>
        </div>
      </div>

      <div className="p-4 container-centered max-w-390">
        <div className="card card--center">
          <div className="avatar avatar--xl avatar--accent">{props.initials}</div>
          <h2 className="mb-2 text-[#E8EAF0]">{props.name}</h2>
          <p className="text-[#9CA3AF]">{props.email}</p>

          <div className="mt-6 pt-6 border-t border-[#2D3548]">
            <h3 className="text-sm font-medium text-[#E8EAF0] mb-3">Настройки приложения</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#9CA3AF]">API Статус</span>
                <span className={`text-sm ${apiHealth === 'healthy' ? 'text-green-500' : 'text-red-500'}`}>
                  {apiHealth === 'healthy' ? '✓ Работает' : '✗ Ошибка'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-[#9CA3AF]">Версия</span>
                <span className="text-sm text-[#E8EAF0]">{props.version}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-[#9CA3AF]">Режим</span>
                <span className="text-sm text-accent">
                  {isPWA ? 'Установлено как PWA' : 'Веб-версия'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-[#9CA3AF]">Офлайн доступ</span>
                <span className="text-sm text-[#38A169]">
                  {isPWA ? 'Доступно' : 'Требуется установка'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
