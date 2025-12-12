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
    <div className="min-h-screen bg-dark pb-24">
      {/* Header */}
      <div className="page__header px-4 pt-12 pb-6">
  <div className="page__header-inner">
          <h1 className="page__title mb-6">AdaptiveRecall</h1>
          
          {/* Today's Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card__label">
                <BookOpen size={16} className="text-accent" />
                <span className="stat-card__meta">Изучено</span>
              </div>
              <p className="stat-value">{statistics.cardsStudiedToday}</p>
            </div>
            
            <div className="stat-card">
              <div className="stat-card__label">
                <Clock size={16} className="text-accent-2" />
                <span className="stat-card__meta">Минут</span>
              </div>
              <p className="stat-value">{statistics.timeSpentToday}</p>
            </div>
            
            <div className="stat-card">
              <div className="stat-card__label">
                <Flame size={16} className="text-accent-2" />
                <span className="stat-card__meta">Дней</span>
              </div>
              <p className="stat-value">{statistics.currentStreak}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main CTA */}
  <div className="p-4 py-6 container-centered max-w-390">
        <Button onClick={onStartStudy} variant="primary" size="large" fullWidth>
          Начать обучение
        </Button>
      </div>
      
      {/* Active Decks */}
  <div className="p-4 container-centered max-w-390">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[#E8EAF0]">Мои колоды</h2>
          <button className="text-sm text-accent">
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