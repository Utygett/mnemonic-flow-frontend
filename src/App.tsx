// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BottomNav } from './components/BottomNav';
import { InstallPrompt } from './components/InstallPrompt';
import { Dashboard } from './screens/Dashboard';
import { StudySession } from './screens/StudySession';
import { CreateCard } from './screens/CreateCard';
import { Statistics } from './screens/Statistics';
import { EditCardFlow } from './screens/EditCardFlow';
import { Onboarding } from './screens/Onboarding/Onboarding';
import { AuthProvider } from './auth/AuthContext';
import { AuthGate } from './auth/AuthGate';
import { toStudyCards } from './utils/toStudyCards';
import { DifficultyRating, StudyCard, Group, StudyMode } from './types';
import { useStatistics, useStudySession } from './hooks';
import useDecks from './hooks/useDecks';
import { ApiClient } from './api/client';
import { loadLastSession, loadSession, saveSession, clearSession, PersistedSession } from './utils/sessionStore';
import { CreateDeck } from './screens/CreateDeck';
import  AddDeck from './screens/AddDeck/AddDeck'
import { EditDeck } from './screens/EditDeck';
import { CreateGroup } from './screens/group/CreateGroup';
import { DeckDetailsScreen } from './screens/deck/DeckDetailsScreen';
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

function MainAppContent() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'study' | 'stats' | 'profile'>('home');
  const [isStudying, setIsStudying] = useState(false);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [apiHealth, setApiHealth] = useState<'healthy' | 'unhealthy' | 'checking'>('checking');
  
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [deckCards, setDeckCards] = useState<StudyCard[]>([]);
  const [loadingDeckCards, setLoadingDeckCards] = useState(false);

  // Используем хуки для получения данных с API
  const { statistics, loading: statsLoading, error: statsError, refresh: refreshStats } = useStatistics();
  const [sessionMode, setSessionMode] = useState<'deck' | 'review'>('review');
  const [sessionKey, setSessionKey] = useState<'review' | `deck:${string}`>('review');
  const [sessionIndex, setSessionIndex] = useState(0);
  const {
    cards,
    currentIndex,
    currentCard,
    isCompleted,
    rateCard,
    skipCard,
    resetSession
  } = useStudySession(deckCards, sessionIndex);
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [resumeCandidate, setResumeCandidate] = useState<null | PersistedSession>(null);
  const dashboardStats = statistics ?? {
  cardsStudiedToday: 0,
  timeSpentToday: 0,
  currentStreak: 0,
  totalCards: 0,
  weeklyActivity: [0,0,0,0,0,0,0],
  achievements: [],
};
const [isCreatingDeck, setIsCreatingDeck] = useState(false);
const [isAddDeck, setIsAddDeck] = useState(false);
const [isEditingDeck, setIsEditingDeck] = useState(false);
const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
const [isCreatingGroup, setIsCreatingGroup] = useState(false);
const [isDeckDetailsOpen, setIsDeckDetailsOpen] = useState(false);
const [deckDetailsId, setDeckDetailsId] = useState<string | null>(null);


  const handleDeckClick = async (deckId: string) => {
    const key = `deck:${deckId}` as const;

    // 1) если есть сохранённая сессия — как у тебя уже сделано
    const saved = loadSession(key);
    if (saved && saved.deckCards.length > 0) {
      setSessionMode(saved.mode);
      setSessionKey(saved.key);
      setActiveDeckId(saved.activeDeckId);
      setSessionIndex(saved.currentIndex ?? 0);
      setDeckCards(saved.deckCards ?? []);
      setIsStudying(true);
      setResumeCandidate(saved);
      return;
    }

    // 2) иначе открываем DeckDetails, а не стартуем study
    setDeckDetailsId(deckId);
    setIsDeckDetailsOpen(true);
  };


  const handleStartDeckStudy = async (deckId: string, mode: StudyMode, limit?: number) => {
    const key = `deck:${deckId}` as const;

    const seed =
      mode === 'random' || mode === 'new_random'
        ? Date.now() % 1_000_000_000
        : undefined;

    // лимит используем только для "new_*"
    const limitNormalized =
      mode === 'new_random' || mode === 'new_ordered'
        ? Math.max(1, Math.min(200, Math.trunc(Number.isFinite(Number(limit)) ? Number(limit) : 20)))
        : undefined;

    try {
      setLoadingDeckCards(true);

      const res = await ApiClient.getStudyCards(deckId, {
        mode,
        seed,
        limit: limitNormalized,
      });

      setDeckCards(res.cards); // важно: сервер должен вернуть StudyCard[]
      setActiveDeckId(deckId);
      setSessionMode('deck');
      setSessionKey(key);
      setSessionIndex(0);

      setIsDeckDetailsOpen(false);
      setDeckDetailsId(null);

      if (res.cards.length > 0) setIsStudying(true);
    } finally {
      setLoadingDeckCards(false);
    }
  };


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

  useEffect(() => {
    if (!isStudying) return;
    setSessionIndex(currentIndex);
  }, [currentIndex, isStudying]);

  useEffect(() => {
    if (!isStudying) return;
    if (loadingDeckCards) return;
    if (deckCards.length === 0) return;

    saveSession({
      key: sessionKey,
      mode: sessionMode,
      activeDeckId,
      // deckName: '', // можно добавить название, если нужно
      deckCards,
      currentIndex,
      isStudying: true,
      savedAt: Date.now(),
    });

    setResumeCandidate(loadLastSession());
  }, [isStudying, loadingDeckCards, sessionKey, sessionMode, activeDeckId, deckCards, currentIndex]);


    useEffect(() => {
    const saved = loadLastSession();
    if (!saved || !saved.isStudying) {
      setResumeCandidate(null);
      return;
    }
    setResumeCandidate(saved);
  }, []);

    const handleResume = () => {
    const saved = resumeCandidate;
    if (!saved) return;

    setSessionMode(saved.mode);
    setSessionKey(saved.key);
    setActiveDeckId(saved.activeDeckId);

    setSessionIndex(saved.currentIndex ?? 0);
    setDeckCards(saved.deckCards ?? []);

    setIsStudying(true);
    setResumeCandidate(null);
  };


    useEffect(() => {
    if (!isStudying) return;
    if (!isCompleted) return;

    clearSession(sessionKey);
    setResumeCandidate(null);

    setIsStudying(false);
    setDeckCards([]);
    setSessionIndex(0);

    resetSession();
  }, [isCompleted, isStudying, sessionKey, resetSession]);


    const handleDiscardResume = () => {
    if (!resumeCandidate) return;
    clearSession(resumeCandidate.key);
    setResumeCandidate(null);
  };



  const handleDeleteActiveGroup = async () => {
    if (!activeGroupId) return;

    const g = groups.find((x) => x.id === activeGroupId);
    const ok = window.confirm(
      `Удалить группу "${g?.title ?? 'без названия'}"? Это действие нельзя отменить.`
    );
    if (!ok) return;

    try {
      await ApiClient.deleteGroup(activeGroupId);

      // после удаления — обновляем список групп
      await refreshGroups();

      // если удалили текущую, refreshGroups выберет валидную или null
      // (а localStorage обновится в useEffect)
    } catch (e) {
      console.error(e);
      alert('Не удалось удалить группу');
    }
  };

  const [activeGroupId, setActiveGroupId] = useState<string | null>(() => {
    const v = localStorage.getItem('active_group_id');
    if (!v || v === 'null' || v === 'undefined' || v.trim() === '') return null;
    return v;
  });


  const [groups, setGroups] = useState<Group[]>([]);

  const { decks, loading: decksLoading, error: decksError, refresh: refreshDecks } =
    useDecks(activeGroupId);

  const currentGroupDeckIds = decks.map((d: any) => d.deck_id ?? d.id);

  useEffect(() => {
    if (activeGroupId) localStorage.setItem('active_group_id', activeGroupId);
  }, [activeGroupId]);





const refreshGroups = React.useCallback(async () => {
  const gs = await ApiClient.getUserGroups();
  setGroups(gs);

  setActiveGroupId((prev) => {
    // 1) пытаемся сохранить текущую, если она ещё существует
    if (prev && gs.some((g) => g.id === prev)) return prev;

    // 2) иначе пробуем взять из localStorage (на случай если prev был null при первом рендере)
    const stored = localStorage.getItem('active_group_id');
    if (stored && gs.some((g) => g.id === stored)) return stored;

    // 3) иначе выбираем первую
    return gs[0]?.id ?? null;
  });
}, []);

useEffect(() => {
  refreshGroups().catch(console.error);
}, [refreshGroups]);

useEffect(() => {
  if (activeGroupId) localStorage.setItem('active_group_id', activeGroupId);
  else localStorage.removeItem('active_group_id');
}, [activeGroupId]);







  const handleLevelUp = async () => {
    const card = cards[currentIndex];
    if (!card) return;

    try {
      const r = await ApiClient.levelUp(card.id);
      setDeckCards(prev =>
        prev.map(c => (c.id === card.id ? { ...c, activeLevel: r.active_level } : c))
      );
    } catch (e) {
      console.error('levelUp failed', e);
    }
  };

  const handleLevelDown = async () => {
    const card = cards[currentIndex];
    if (!card) return;

    try {
      const r = await ApiClient.levelDown(card.id);
      setDeckCards(prev =>
        prev.map(c => (c.id === card.id ? { ...c, activeLevel: r.active_level } : c))
      );
    } catch (e) {
      console.error('levelDown failed', e);
    }
  };


  const handleSkipCard = () => {
    skipCard();
  };

  const handleRemoveFromProgress = async () => {
    const card = cards[currentIndex];
    if (!card) return;

    try {
      // 1) удалить прогресс на сервере
      await ApiClient.deleteCardProgress(card.id);

      // 2) убрать карточку из локальной очереди (чтобы исчезла прямо сейчас)
      skipCard();
    } catch (e) {
      console.error('delete progress failed', e);
    }
  };




  const handleStartStudy = async () => {
    try {
      setLoadingDeckCards(true);

      const items = await ApiClient.getReviewSession(20); // GET /cards/review_with_levels?limit=20
      setDeckCards(toStudyCards(items));                  // <-- и тут используем
      setActiveDeckId(null);
      setIsStudying(true);
      setSessionMode('review');
      setSessionKey('review');
      setSessionIndex(0);
    } finally {
      setLoadingDeckCards(false);
    }
  };

  
const handleRate = async (rating: DifficultyRating) => {
  try {
    await rateCard(rating);
    refreshStats();
  } catch (error) {
    console.error('Error rating card:', error);
  }
};
  
  const handleCloseStudy = () => {
    if (deckCards.length > 0) {
      const snap: PersistedSession = {
        key: sessionKey,
        mode: sessionMode,
        activeDeckId,
        deckCards,
        currentIndex,
        isStudying: true,
        savedAt: Date.now(),
      };
      saveSession(snap);
      setResumeCandidate(snap);
    }

    setIsStudying(false);
    setDeckCards([]);        // чтобы очередь "сбросилась" в хуке
    setSessionIndex(0);      // необязательно, но ок
    setActiveTab('home');
  };

  const handleSaveCard = async (cardData: { deckId: string; term: string; type: string; levels: Array<{question: string; answer: string}> }) => {
    await ApiClient.createCard({
      deck_id: cardData.deckId,
      title: cardData.term,
      type: cardData.type,
      levels: cardData.levels,
    });

    refreshDecks();
    refreshStats();
    setIsCreatingCard(false);
  };

  

  const handleSaveCardsMany = async (
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

    // один рефреш после пачки
    refreshDecks();
    refreshStats();

    return { created, failed: errors.length, errors };
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
  if (statsError) {
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
  
  // if (!hasCompletedOnboarding) {
  //   return <Onboarding onComplete={() => setHasCompletedOnboarding(true)} />;
  // }
  
if (isDeckDetailsOpen && deckDetailsId) {
  return (
    <DeckDetailsScreen
      deckId={deckDetailsId}
      onBack={() => { setIsDeckDetailsOpen(false); setDeckDetailsId(null); }}
      onStart={(mode, limit) => handleStartDeckStudy(deckDetailsId, mode, limit)}
    />
  );
}


if (isStudying) {
  // 1️⃣ Загрузка карточек
  
  if (loadingDeckCards) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-[#9CA3AF]">Загрузка карточек…</div>
      </div>
    );
  }

  if (deckCards.length === 0) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="card text-center max-w-390">
          <h2 className="text-[#E8EAF0] mb-2">Нет карточек</h2>
          <p className="text-[#9CA3AF] mb-6">
            В этой сессии нет карточек для изучения.
          </p>
          <button
            className="btn-primary w-full"
            onClick={() => {
              resetSession();
              setIsStudying(false);
            }}
          >
            Вернуться
          </button>
        </div>
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
  if (cards.length === 0) {
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
        cards={cards}
        currentIndex={currentIndex}
        onRate={handleRate}
        onLevelUp={handleLevelUp}
        onLevelDown={handleLevelDown}
        onClose={handleCloseStudy}
        onSkip={handleSkipCard}
        onRemoveFromProgress={handleRemoveFromProgress}
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
          decks={decks}
          onSave={handleSaveCard}
          onSaveMany={handleSaveCardsMany}
          onCancel={() => setIsCreatingCard(false)}
        />
        <PWAUpdatePrompt />
        <OfflineStatus />
      </>
    );
  }
  
    if (isCreatingDeck) {
    return (
      <CreateDeck
        onCancel={() => setIsCreatingDeck(false)}
        onSave={(createdDeckId) => {
          refreshDecks();
          setIsCreatingDeck(false);
        }}
      />
    );
  }


  if (isCreatingGroup) {
    return (
      <CreateGroup
        onCancel={() => setIsCreatingGroup(false)}
        onSave={async (createdGroupId) => {
          await refreshGroups();          // перезагружаем список групп
          if (createdGroupId) setActiveGroupId(createdGroupId); // если есть id — выбираем
          setIsCreatingGroup(false);
        }}
      />
    );
  }

    if (isEditingDeck && editingDeckId) {
      return (
        <EditDeck
          deckId={editingDeckId}
          onCancel={() => setIsEditingDeck(false)}
          onSaved={() => {
            refreshDecks();
            setIsEditingDeck(false);
          }}
        />
      );
    }

  if (isAddDeck) {
    if (!activeGroupId) {
      // можно показать ошибку/заглушку
      return null;
    }
    return (
      <AddDeck
        groupId={activeGroupId}
        initialGroupDeckIds={currentGroupDeckIds}
        onClose={() => setIsAddDeck(false)}
        onChanged={() => {
          // после add/remove обновляем колоды группы
          refreshDecks();
        }}
      />
    );
  }


  if (isEditingCard) {
    return (
      <>
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
           <Dashboa rd
              statistics={dashboardStats}
              decks={decks}
              groups={groups}
              activeGroupId={activeGroupId}
              onGroupChange={setActiveGroupId}
              onCreateGroup={() => setIsCreatingGroup(true)}
              onDeleteActiveGroup={handleDeleteActiveGroup}
              onStartStudy={handleStartStudy}
              onDeckClick={handleDeckClick}
              onEditDeck={(deckId) => {
                setEditingDeckId(deckId);
                setIsEditingDeck(true);
              }}
              resumeSession={
                resumeCandidate
                  ? {
                      title: 'Продолжить сессию',
                      subtitle:
                        resumeCandidate.mode === 'review'
                          ? 'Учебная сессия'
                          : (decks.find(d => d.deck_id === resumeCandidate.activeDeckId)?.title ?? 'Колода'),
                      cardInfo:
                        `Карточка ${resumeCandidate.currentIndex + 1} из ${resumeCandidate.deckCards.length}`,
                      onResume: handleResume,
                      onDiscard: handleDiscardResume,
                    }
                  : undefined
              }
              onCreateDeck={() => setIsCreatingDeck(true)}
              onAddDesk={() => setIsAddDeck(true)}
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
                  <h2 className="mb-2 text-[#E8EAF0]">АБД</h2>
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


