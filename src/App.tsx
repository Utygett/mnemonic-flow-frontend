import React, { useState, useEffect } from 'react';
import { BottomNav } from './components/BottomNav';
import { InstallPrompt } from './components/InstallPrompt';
import { Dashboard } from './screens/Dashboard';
import { StudySession } from './screens/StudySession';
import { CreateCard } from './screens/CreateCard';
import { Statistics } from './screens/Statistics';
import { Onboarding } from './screens/Onboarding';
import { Card, Deck, Statistics as StatsType, DifficultyRating } from './types';

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
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
  // Проверяем, было ли приложение установлено как PWA
  const [isPWA, setIsPWA] = useState(false);
  
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
  
  // Mock Data
  const [decks, setDecks] = useState<Deck[]>([
    {
      id: '1',
      name: 'Биология',
      description: 'Основные понятия биологии',
      cardsCount: 45,
      progress: 68,
      averageLevel: 1.5,
      color: '#4A6FA5',
    },
    {
      id: '2',
      name: 'История',
      description: 'Важные исторические события',
      cardsCount: 32,
      progress: 45,
      averageLevel: 1.2,
      color: '#FF9A76',
    },
    {
      id: '3',
      name: 'Программирование',
      description: 'Основы JavaScript',
      cardsCount: 56,
      progress: 82,
      averageLevel: 2.3,
      color: '#38A169',
    },
  ]);
  
  const [cards, setCards] = useState<Card[]>([
    {
      id: '1',
      term: 'Фотосинтез',
      levels: [
        'Процесс превращения света в энергию',
        'Процесс, при котором растения преобразуют световую энергию в химическую, создавая глюкозу из CO₂ и H₂O',
        'Объясните, почему фотосинтез важен для всей экосистемы планеты',
        'Сравните световую и темновую фазы фотосинтеза, укажите продукты каждой фазы',
      ],
      currentLevel: 1,
      nextReview: new Date(),
      streak: 3,
      deckId: '1',
    },
    {
      id: '2',
      term: 'Митоз',
      levels: [
        'Деление клетки',
        'Процесс деления соматических клеток, при котором из одной клетки образуются две идентичные',
        'В чем разница между митозом и мейозом?',
        'Опишите все фазы митоза и что происходит с хромосомами на каждом этапе',
      ],
      currentLevel: 0,
      nextReview: new Date(),
      streak: 1,
      deckId: '1',
    },
    {
      id: '3',
      term: 'ДНК',
      levels: [
        'Носитель генетической информации',
        'Дезоксирибонуклеиновая кислота - молекула, хранящая генетическую информацию',
        'Как структура ДНК связана с её функцией?',
        'Объясните процесс репликации ДНК и роль ферментов в этом процессе',
      ],
      currentLevel: 2,
      nextReview: new Date(),
      streak: 5,
      deckId: '1',
    },
  ]);
  
  const [statistics, setStatistics] = useState<StatsType>({
    cardsStudiedToday: 24,
    timeSpentToday: 35,
    currentStreak: 7,
    totalCards: 133,
    weeklyActivity: [15, 22, 18, 25, 20, 24, 19],
    achievements: [
      {
        id: '1',
        title: '7 дней',
        description: 'Недельная серия',
        icon: 'trophy',
        unlocked: true,
      },
      {
        id: '2',
        title: '100 карточек',
        description: 'Изучено 100 карточек',
        icon: 'target',
        unlocked: true,
      },
      {
        id: '3',
        title: 'Скорость',
        description: '50 карточек за день',
        icon: 'zap',
        unlocked: false,
      },
    ],
  });
  
  const handleStartStudy = () => {
    setIsStudying(true);
    setCurrentCardIndex(0);
  };
  
  const handleRate = (rating: DifficultyRating) => {
    // Update statistics
    setStatistics({
      ...statistics,
      cardsStudiedToday: statistics.cardsStudiedToday + 1,
    });
    
    // Move to next card
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // Session complete
      setIsStudying(false);
      setCurrentCardIndex(0);
    }
  };
  
  const handleLevelUp = () => {
    const currentCard = cards[currentCardIndex];
    if (currentCard.currentLevel < currentCard.levels.length - 1) {
      const updatedCards = cards.map((card) =>
        card.id === currentCard.id
          ? { ...card, currentLevel: card.currentLevel + 1 }
          : card
      );
      setCards(updatedCards);
    }
  };
  
  const handleCloseStudy = () => {
    setIsStudying(false);
    setCurrentCardIndex(0);
  };
  
  const handleSaveCard = (cardData: any) => {
    const newCard: Card = {
      id: Date.now().toString(),
      term: cardData.term,
      levels: cardData.levels,
      currentLevel: 0,
      nextReview: new Date(),
      streak: 0,
      deckId: '1',
    };
    setCards([...cards, newCard]);
    setIsCreatingCard(false);
  };
  
  const handleDeckClick = (deckId: string) => {
    // Filter cards for this deck and start study
    setIsStudying(true);
    setCurrentCardIndex(0);
  };
  
  if (!hasCompletedOnboarding) {
    return <Onboarding onComplete={() => setHasCompletedOnboarding(true)} />;
  }
  
  if (isStudying) {
    return (
      <>
        <StudySession
          cards={cards}
          currentIndex={currentCardIndex}
          onRate={handleRate}
          onLevelUp={handleLevelUp}
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
          statistics={statistics}
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
      
      {activeTab === 'stats' && (
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