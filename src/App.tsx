import React, { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { InstallPrompt } from './components/InstallPrompt';
import { Dashboard } from './screens/Dashboard';
import { StudySession } from './screens/StudySession';
import { CreateCard } from './screens/CreateCard';
import { Statistics } from './screens/Statistics';
import { Onboarding } from './screens/Onboarding';
import { Card, Deck, Statistics as StatsType, DifficultyRating } from './types';

export default function App() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'study' | 'stats' | 'profile'>('home');
  const [isStudying, setIsStudying] = useState(false);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
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
      levels: {
        level0: 'Процесс превращения света в энергию',
        level1: 'Процесс, при котором растения преобразуют световую энергию в химическую, создавая глюкозу из CO₂ и H₂O',
        level2: 'Объясните, почему фотосинтез важен для всей экосистемы планеты',
        level3: 'Сравните световую и темновую фазы фотосинтеза, укажите продукты каждой фазы',
      },
      currentLevel: 1,
      nextReview: new Date(),
      streak: 3,
      deckId: '1',
    },
    {
      id: '2',
      term: 'Митоз',
      levels: {
        level0: 'Деление клетки',
        level1: 'Процесс деления соматических клеток, при котором из одной клетки образуются две идентичные',
        level2: 'В чем разница между митозом и мейозом?',
        level3: 'Опишите все фазы митоза и что происходит с хромосомами на каждом этапе',
      },
      currentLevel: 0,
      nextReview: new Date(),
      streak: 1,
      deckId: '1',
    },
    {
      id: '3',
      term: 'ДНК',
      levels: {
        level0: 'Носитель генетической информации',
        level1: 'Дезоксирибонуклеиновая кислота - молекула, хранящая генетическую информацию',
        level2: 'Как структура ДНК связана с её функцией?',
        level3: 'Объясните процесс репликации ДНК и роль ферментов в этом процессе',
      },
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
    if (currentCard.currentLevel < 3) {
      const updatedCards = cards.map((card) =>
        card.id === currentCard.id
          ? { ...card, currentLevel: (card.currentLevel + 1) as 0 | 1 | 2 | 3 }
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
      <StudySession
        cards={cards}
        currentIndex={currentCardIndex}
        onRate={handleRate}
        onLevelUp={handleLevelUp}
        onClose={handleCloseStudy}
      />
    );
  }
  
  if (isCreatingCard) {
    return (
      <CreateCard
        onSave={handleSaveCard}
        onCancel={() => setIsCreatingCard(false)}
      />
    );
  }
  
  return (
    <div className="relative">
      {activeTab === 'home' && (
        <Dashboard
          statistics={statistics}
          decks={decks}
          onStartStudy={handleStartStudy}
          onDeckClick={handleDeckClick}
        />
      )}
      
      {activeTab === 'study' && (
        <div className="min-h-screen bg-[#F5F7FA] pb-24">
          <div className="bg-white px-4 pt-12 pb-6 shadow-sm">
            <div className="max-w-[390px] mx-auto">
              <h1 className="mb-6">Обучение</h1>
            </div>
          </div>
          <div className="px-4 py-6 max-w-[390px] mx-auto">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📖</div>
              <h2 className="mb-4">Создайте свою первую карточку</h2>
              <p className="text-[#718096] mb-6">
                Начните изучение с создания карточек
              </p>
              <button
                onClick={() => setIsCreatingCard(true)}
                className="bg-[#4A6FA5] text-white px-6 py-3 rounded-lg"
              >
                Создать карточку
              </button>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'stats' && (
        <Statistics statistics={statistics} decks={decks} />
      )}
      
      {activeTab === 'profile' && (
        <div className="min-h-screen bg-[#F5F7FA] pb-24">
          <div className="bg-white px-4 pt-12 pb-6 shadow-sm">
            <div className="max-w-[390px] mx-auto">
              <h1 className="mb-6">Профиль</h1>
            </div>
          </div>
          <div className="px-4 py-6 max-w-[390px] mx-auto">
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="w-24 h-24 bg-[#4A6FA5] rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl">
                У
              </div>
              <h2 className="mb-2">Пользователь</h2>
              <p className="text-[#718096]">user@example.com</p>
            </div>
          </div>
        </div>
      )}
      
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <InstallPrompt />
    </div>
  );
}