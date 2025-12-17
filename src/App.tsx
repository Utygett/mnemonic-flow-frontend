import React, { useState, useEffect } from 'react';
import { BottomNav } from './components/BottomNav';
import { InstallPrompt } from './components/InstallPrompt';
import { Dashboard } from './screens/Dashboard';
import { StudySession } from './screens/StudySession';
import { CreateCard } from './screens/CreateCard';
import { Statistics } from './screens/Statistics';
import { Onboarding } from './screens/Onboarding/Onboarding';
import { AuthProvider } from './auth/AuthContext';
import { AuthGate } from './auth/AuthGate';
import { CardType, Card, Deck, Statistics as StatsType, DifficultyRating } from './types';
import { useDecks, useStatistics, useStudySession } from './hooks';
import { ApiClient } from './api/client';

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
            <button onClick={() => setShowReload(false)} className="btn-ghost">Позже</button>
            <button onClick={reloadPage} className="btn-primary">Обновить</button>
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

export default function App() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'study' | 'stats' | 'profile'>('home');
  const [isStudying, setIsStudying] = useState(false);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [apiHealth, setApiHealth] = useState<'healthy' | 'unhealthy' | 'checking'>('checking');
  
  // Используем хуки для получения данных с API
  const { decks, loading: decksLoading, error: decksError, refresh: refreshDecks } = useDecks();
  const { statistics, loading: statsLoading, error: statsError, refresh: refreshStats } = useStatistics();
  const { 
    session, 
    currentCard, 
    isCompleted, 
    loading: sessionLoading, 
    error: sessionError, 
    rateCard,
    levelUpCard,
    resetSession 
  } = useStudySession();
  
  // Проверяем, было ли приложение установлено как PWA
  useEffect(() => {
    // Проверка на установку как PWA
    const checkPWA = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone ||
          document.referrer.includes('android-app://')) {
        setIsPWA(true);
      }
    };
    
    checkPWA();
    
    // Регистрация Service Worker для PWA
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
  
  const handleStartStudy = () => {
    setIsStudying(true);
  };
  
  const handleRate = async (rating: DifficultyRating) => {
    try {
      await rateCard(rating);
      
      // Обновляем статистику после ответа
      refreshStats();
      
      // Если сессия завершена
      if (isCompleted) {
        setIsStudying(false);
        resetSession();
      }
    } catch (error) {
      console.error('Error rating card:', error);
    }
  };
  
  const handleLevelUp = () => {
    // Логика повышения уровня уже обрабатывается в API
  };
  
  const handleCloseStudy = () => {
    setIsStudying(false);
    resetSession();
  };
  
  const handleSaveCard = async (cardData: any) => {
    try {
      await ApiClient.createCard({
        term: cardData.term,
        levels: cardData.levels,
        deckId: cardData.deckId || '1',
        cardType: CardType.Flashcard,
      });
      
      // Обновляем данные после создания карточки
      refreshDecks();
      refreshStats();
      setIsCreatingCard(false);
    } catch (error) {
      console.error('Error creating card:', error);
    }
  };
  
  const handleDeckClick = (deckId: string) => {
    // Можно добавить логику для начала изучения конкретной колоды
    setIsStudying(true);
  };
  
  // Показываем загрузку
  if (decksLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-[#9CA3AF]">Загрузка данных...</p>
        </div>
      </div>
    );
  }
  
  // Показываем ошибку загрузки
  if (decksError || statsError) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="card text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-[#E8EAF0] mb-2">Ошибка загрузки</h2>
          <p className="text-[#9CA3AF] mb-4">{decksError || statsError}</p>
          <button 
            onClick={() => { refreshDecks(); refreshStats(); }} 
            className="btn-primary"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }
  
  if (!hasCompletedOnboarding) {
    return <Onboarding onComplete={() => setHasCompletedOnboarding(true)} />;
  }
  
if (isStudying) {
  // 1️⃣ Загрузка карточек
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-[#9CA3AF]">Загрузка карточек…</div>
      </div>
    );
  }

  // 2️⃣ Сессия завершена
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="card text-center max-w-390">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h2 className="text-[#E8EAF0] mb-2">Сессия завершена</h2>
          <p className="text-[#9CA3AF] mb-6">
            Отличная работа! Ты прошёл все карточки.
          </p>
          <button
            className="btn-primary w-full"
            onClick={() => {
              resetSession();
              setIsStudying(false);
            }}
          >
            Вернуться в меню
          </button>
        </div>
      </div>
    );
  }

  // 3️⃣ Нет карточек
  if (session.cards.length === 0) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-[#9CA3AF]">Нет карточек для изучения</div>
      </div>
    );
  }

  // 4️⃣ Обычная сессия
  return (
    <>
      <StudySession
        cards={session.cards}
        currentIndex={session.currentIndex}
        onRate={handleRate}
        onLevelUp={levelUpCard}
        onClose={handleCloseStudy}
      />
      <PWAUpdatePrompt />
      <OfflineStatus />
    </>
  );
}


  
  if (isCreatingCard) {
    return (
      <>
        <CreateCard
          onSave={handleSaveCard}
          onCancel={() => setIsCreatingCard(false)}
        />
        <PWAUpdatePrompt />
        <OfflineStatus />
      </>
    );
  }
  
  return (
    <div className="relative">
      {/* Уведомление об обновлении PWA */}
      <PWAUpdatePrompt />
      
      {/* Статус офлайн-режима */}
      <OfflineStatus />
      
      {/* Индикатор статуса API */}
      {apiHealth === 'unhealthy' && (
        <div className="fixed top-4 right-4 z-30">
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
            API Offline
          </div>
        </div>
      )}
      
      {/* PWA Badge (только если установлено как PWA) */}
      {isPWA && (
        <div className="fixed top-4 left-4 z-30">
          <div className="pwa-badge">
            PWA
          </div>
        </div>
      )}
      
      {activeTab === 'home' && (
        <Dashboard
          statistics={statistics || {
            cardsStudiedToday: 0,
            timeSpentToday: 0,
            currentStreak: 0,
            totalCards: 0,
            weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
            achievements: [],
          }}
          decks={decks}
          onStartStudy={handleStartStudy}
          onDeckClick={handleDeckClick}
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
              <button onClick={() => setIsCreatingCard(true)} className="btn-primary">Создать карточку</button>

              {/* PWA Installation Hint */}
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
      
      {activeTab === 'stats' && statistics && (
        <Statistics statistics={statistics} decks={decks} />
      )}
      
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
              <h2 className="mb-2 text-[#E8EAF0]">Пользователь</h2>
              <p className="text-[#9CA3AF]">user@example.com</p>
              
              {/* PWA Status */}
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
      
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <InstallPrompt />
    </div>
  );
}