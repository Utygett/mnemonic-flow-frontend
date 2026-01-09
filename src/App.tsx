// src/App.tsx
import React, { useState, useEffect } from 'react';

import { BottomNav } from './components/BottomNav';
import { InstallPrompt } from './components/InstallPrompt';

import { CreateCard } from './screens/CreateCard';
import { Statistics } from './screens/Statistics';
import { EditCardFlow } from './screens/EditCardFlow';
import { EditDeck } from './screens/EditDeck';
import { CreateDeck } from './screens/CreateDeck';

import { AuthProvider } from './auth/AuthContext';
import { AuthGate } from './auth/AuthGate';

import { ApiClient } from './api/client';
import { useStatistics } from './hooks';
import { useGroupsDecksController } from './hooks/useGroupsDecksController';

import { HomeTabContainer } from './screens/home/HomeTabContainer';
import { StudyFlowStateContainer } from './screens/study/StudyFlowStateContainer';

import { ResetPasswordPage } from './screens/auth/ResetPasswordPage';
import { VerifyEmailPage } from './screens/auth/VerifyEmailPage';

// Компонент для отображения обновлений PWA
function PWAUpdatePrompt() {
  const [showReload, setShowReload] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowReload(true);
                setWaitingWorker(newWorker);
              }
            });
          }
        });
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const reloadPage = () => {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
    setShowReload(false);
    window.location.reload();
  };

  if (!showReload) return null;

  return (
    <div className="update-prompt">
      <div className="update-prompt__inner">
        <div className="update-prompt__row">
          <div className="update-prompt__icon">🔄</div>
          <div>
            <p style={{ color: '#E8EAF0', fontWeight: 500 }}>Доступно обновление!</p>
            <p style={{ color: '#9CA3AF', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Новая версия приложения загружена. Обновите для получения новых функций.
            </p>
          </div>
          <div className="update-prompt__actions">
            <button onClick={() => setShowReload(false)} className="btn-ghost">
              Позже
            </button>
            <button onClick={reloadPage} className="btn-primary">
              Обновить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент для отображения статуса офлайн-режима
function OfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="offline-status">
      <div className="offline-status__inner">
        <div className="pulse-dot" />
        <span style={{ color: '#FF9A76' }}>Работаем в офлайн-режиме</span>
      </div>
    </div>
  );
}

function MainAppContent() {
  const {
    groups,
    activeGroupId,
    setActiveGroupId,
    decks,
    decksLoading,
    decksError,
    refreshDecks,
    refreshGroups,
    deleteActiveGroup,
    currentGroupDeckIds,
  } = useGroupsDecksController();

  const { statistics, loading: statsLoading, error: statsError, refresh: refreshStats } = useStatistics();

  const dashboardStats = statistics ?? {
    cardsStudiedToday: 0,
    timeSpentToday: 0,
    currentStreak: 0,
    totalCards: 0,
    weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
    achievements: [],
  };

  const [activeTab, setActiveTab] = useState<'home' | 'study' | 'stats' | 'profile'>('home');

  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [isEditingCard, setIsEditingCard] = useState(false);

  const [isPWA, setIsPWA] = useState(false);
  const [apiHealth, setApiHealth] = useState<'healthy' | 'unhealthy' | 'checking'>('checking');

  const [isCreatingDeck, setIsCreatingDeck] = useState(false); // пока у тебя нет отдельного экрана — оставлено как было
  const [isEditingDeck, setIsEditingDeck] = useState(false);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);

  const openEditDeck = (deckId: string) => {
    setEditingDeckId(deckId);
    setIsEditingDeck(true);
  };

  // Проверяем, было ли приложение установлено как PWA
  useEffect(() => {
    const checkPWA = () => {
      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://')
      ) {
        setIsPWA(true);
      }
    };

    checkPWA();

    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
      });
    }
  }, []);

  // Проверка здоровья API
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        await ApiClient.healthCheck();
        setApiHealth('healthy');
      } catch (error) {
        setApiHealth('unhealthy');
        console.warn('API is unavailable, using fallback data');
      }
    };

    checkApiHealth();
  }, []);

  return (
    <StudyFlowStateContainer onExitToHome={() => setActiveTab('home')} onRated={refreshStats}>
      {(study) => {
        const hideBottomNav =
          study.isStudying ||
          decksLoading ||
          statsLoading ||
          Boolean(statsError) ||
          isCreatingCard ||
          isEditingCard ||
          (isEditingDeck && Boolean(editingDeckId));

        let content: React.ReactNode = null;

        if (decksLoading || statsLoading) {
          content = (
            <div className="min-h-screen bg-dark flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
                <p className="text-[#9CA3AF]">Загрузка данных...</p>
              </div>
            </div>
          );
        } else if (statsError) {
          content = (
            <div className="min-h-screen bg-dark flex items-center justify-center p-4">
              <div className="card text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h2 className="text-[#E8EAF0] mb-2">Ошибка загрузки</h2>
                <p className="text-[#9CA3AF] mb-4">{decksError || statsError}</p>
                <button onClick={() => { refreshDecks(); refreshStats(); }} className="btn-primary">
                  Попробовать снова
                </button>
              </div>
            </div>
          );
        } else if (isCreatingCard) {
          content = (
            <CreateCard
              decks={decks}
              onSave={async (cardData: { deckId: string; term: string; type: string; levels: Array<{ question: string; answer: string }> }) => {
                await ApiClient.createCard({
                  deck_id: cardData.deckId,
                  title: cardData.term,
                  type: cardData.type,
                  levels: cardData.levels,
                });

                refreshDecks();
                refreshStats();
                setIsCreatingCard(false);
              }}
              onSaveMany={async (
                cards: Array<{ deckId: string; term: string; type: 'flashcard'; levels: Array<{ question: string; answer: string }> }>
              ): Promise<{ created: number; failed: number; errors?: string[] }> => {
                const errors: string[] = [];
                let created = 0;

                for (let i = 0; i < cards.length; i++) {
                  const c = cards[i];
                  try {
                    await ApiClient.createCard({
                      deck_id: c.deckId,
                      title: c.term,
                      type: c.type,
                      levels: c.levels,
                    });
                    created++;
                  } catch (e: any) {
                    errors.push(`${i}: ${String(e?.message ?? e)}`);
                  }
                }

                refreshDecks();
                refreshStats();
                return { created, failed: errors.length, errors };
              }}
              onCancel={() => setIsCreatingCard(false)}
            />
          );
        } else if (isCreatingDeck) {
          content = (
            <CreateDeck
              onCancel={() => setIsCreatingDeck(false)}
              onSave={(createdDeckId) => {
                refreshDecks();
                setIsCreatingDeck(false);
              }}
            />
          );
        } else if (isEditingDeck && editingDeckId) {
          content = (
            <EditDeck
              deckId={editingDeckId}
              onCancel={() => setIsEditingDeck(false)}
              onSaved={() => {
                refreshDecks();
                setIsEditingDeck(false);
              }}
            />
          );
        } else if (isEditingCard) {
          content = (
            <EditCardFlow
              decks={decks}
              onCancel={() => setIsEditingCard(false)}
              onDone={() => {
                refreshDecks();
                refreshStats();
                setIsEditingCard(false);
              }}
              onEditDeck={(deckId) => {
                setEditingDeckId(deckId);
                setIsEditingDeck(true);
              }}
            />
          );
        } else {
          content = (
            <>
              {/* PWA Badge (только если установлено как PWA) */}
              {isPWA && (
                <div className="fixed top-4 left-4 z-30">
                  <div className="pwa-badge">PWA</div>
                </div>
              )}

              {activeTab === 'home' && (
                <HomeTabContainer
                  statistics={dashboardStats}
                  decks={decks}
                  groups={groups}
                  activeGroupId={activeGroupId}
                  setActiveGroupId={setActiveGroupId}
                  refreshGroups={refreshGroups}
                  refreshDecks={refreshDecks}
                  currentGroupDeckIds={currentGroupDeckIds}
                  onDeleteActiveGroup={deleteActiveGroup}
                  resumeCandidate={study.resumeCandidate}
                  onResume={study.onResume}
                  onDiscardResume={study.onDiscardResume}
                  onStartReviewStudy={study.onStartReviewStudy}
                  onStartDeckStudy={study.onStartDeckStudy}
                  onResumeDeckSession={study.onResumeDeckSession}
                  onRestartDeckSession={study.onRestartDeckSession}
                  onOpenEditDeck={openEditDeck}
                />
              )}

              {activeTab === 'study' && (
                <div className="min-h-screen bg-dark pb-24">
                  <header className="page__header">
                    <div className="page__header-inner">
                      <h1 className="page__title">Обучение</h1>
                    </div>
                  </header>

                  <main className="container-centered max-w-390 py-6">
                    <div className="text-center py-12">
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📖</div>
                      <h2 style={{ marginBottom: '1rem', color: '#E8EAF0' }}>Создайте свою первую карточку</h2>
                      <p style={{ color: '#9CA3AF', marginBottom: '1.5rem' }}>
                        Начните изучение с создания карточек
                      </p>

                      <div className="actionsStack__study">
                        <button onClick={() => setIsCreatingCard(true)} className="btn-primary">
                          Создать карточку
                        </button>

                        <button onClick={() => setIsCreatingDeck(true)} className="btn-primary">
                          Создать колоду
                        </button>

                        <button onClick={() => setIsEditingCard(true)} className="btn-primary">
                          Редактировать колоду
                        </button>
                      </div>

                      {!isPWA && (
                        <div className="mt-8 card">
                          <p style={{ color: '#9CA3AF', marginBottom: '0.5rem' }}>
                            💡 Установите приложение для работы офлайн
                          </p>
                          <p style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                            Нажмите "Установить" в меню браузера
                          </p>
                        </div>
                      )}
                    </div>
                  </main>
                </div>
              )}

              {activeTab === 'stats' && statistics && <Statistics statistics={statistics} decks={decks} />}

              {activeTab === 'profile' && (
                <div className="min-h-screen bg-dark pb-24">
                  <div className="page__header px-4 pt-12 pb-6">
                    <div className="page__header-inner">
                      <h1 className="page__title">Профиль</h1>
                    </div>
                  </div>

                  <div className="p-4 container-centered max-w-390">
                    <div className="card card--center">
                      <div className="avatar avatar--xl avatar--accent">У</div>
                      <h2 className="mb-2 text-[#E8EAF0]">АБД</h2>
                      <p className="text-[#9CA3AF]">user@example.com</p>

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
                            <span className="text-sm text-[#E8EAF0]">1.0.0</span>
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
              )}
            </>
          );
        }

        return (
          <div className="relative">
            <PWAUpdatePrompt />
            <OfflineStatus />

            {content}

            {!hideBottomNav && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
            <InstallPrompt />
          </div>
        );
      }}
    </StudyFlowStateContainer>
  );
}

function getPathRoute() {
  const path = window.location.pathname || '/';
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') || '';
  return { path, token };
}

export default function App() {
  const { path, token } = getPathRoute();

  if (path === '/reset-password') {
    return (
      <AuthProvider>
        <ResetPasswordPage token={token} />
      </AuthProvider>
    );
  }

  if (path === '/verify-email') {
    return (
      <AuthProvider>
        <VerifyEmailPage token={token} />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <AuthGate>
        <MainAppContent />
      </AuthGate>
    </AuthProvider>
  );
}
