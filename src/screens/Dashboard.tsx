import React from 'react';
import { Statistics, Deck } from '../types';
import { Button } from '../components/Button';
import { DeckCard } from '../components/DeckCard';
import { Clock, BookOpen, Flame } from 'lucide-react';

interface DashboardProps {
  statistics: Statistics;
  decks: Deck[];
  onStartStudy: () => void;
  onDeckClick: (deckId: string) => void;
}

export function Dashboard({ statistics, decks, onStartStudy, onDeckClick }: DashboardProps) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-6 shadow-sm">
        <div className="max-w-[390px] mx-auto">
          <h1 className="mb-6">AdaptiveRecall</h1>
          
          {/* Today's Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#F5F7FA] rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen size={16} className="text-[#4A6FA5]" />
                <span className="text-xs text-[#718096]">Изучено</span>
              </div>
              <p className="text-2xl">{statistics.cardsStudiedToday}</p>
            </div>
            
            <div className="bg-[#F5F7FA] rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={16} className="text-[#FF9A76]" />
                <span className="text-xs text-[#718096]">Минут</span>
              </div>
              <p className="text-2xl">{statistics.timeSpentToday}</p>
            </div>
            
            <div className="bg-[#F5F7FA] rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Flame size={16} className="text-[#FF9A76]" />
                <span className="text-xs text-[#718096]">Дней</span>
              </div>
              <p className="text-2xl">{statistics.currentStreak}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main CTA */}
      <div className="px-4 py-6 max-w-[390px] mx-auto">
        <Button onClick={onStartStudy} variant="primary" size="large" fullWidth>
          Начать обучение
        </Button>
      </div>
      
      {/* Active Decks */}
      <div className="px-4 max-w-[390px] mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2>Мои колоды</h2>
          <button className="text-sm text-[#4A6FA5]">
            Все
          </button>
        </div>
        
        <div className="space-y-3">
          {decks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onClick={() => onDeckClick(deck.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
