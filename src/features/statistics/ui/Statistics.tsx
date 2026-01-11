import React from 'react';

import { Trophy, Target, Zap } from 'lucide-react';

import type { Deck, Statistics as StatsType } from '../../../types';
import { ProgressBar } from '../../../shared/ui/ProgressBar';

export interface StatisticsProps {
  statistics: StatsType;
  decks: Deck[];
}

export function Statistics({ statistics, decks }: StatisticsProps) {
  const totalProgress = decks.reduce((acc, deck) => acc + deck.progress, 0) / decks.length;

  return (
    <div className="stats-page">
      {/* Header */}
      <div className="page__header px-4 pt-12 pb-6">
        <div className="page__header-inner">
          <h1 className="page__title mb-6">Статистика</h1>

          {/* Overall Progress Circle */}
          <div className="stats__progress-wrap">
            <div className="stats__progress-circle">
              <svg className="stats__svg">
                <circle cx="80" cy="80" r="70" stroke="#E5E7EB" strokeWidth="12" fill="none" />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#FF9A76"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - totalProgress / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="stats__progress-center">
                <div className="text-center">
                  <div className="stats__progress-value">{Math.round(totalProgress)}%</div>
                  <div className="stats__progress-label">Общий прогресс</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 py-6 container-centered stats__content">
        {/* Weekly Activity */}
        <div className="card">
          <h3 className="mb-4">Активность за неделю</h3>
          <div className="stats__bars">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => {
              const value = statistics.weeklyActivity[index] || 0;
              const maxValue = Math.max(...statistics.weeklyActivity, 1);
              const height = (value / maxValue) * 100;

              return (
                <div key={day} className="stats__bar-col">
                  <div className="stats__bar-track" style={{ height: '100px' }}>
                    <div className="stats__bar-fill" style={{ height: `${height}%` }} />
                  </div>
                  <span className="stats__bar-label">{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Decks Progress */}
        <div>
          <h3 className="mb-4">Прогресс по темам</h3>
          <div className="space-y-3">
            {decks.map((deck) => (
              <div key={deck.id} className="card">
                <div className="deck-row">
                  <div>
                    <h3 className="text-base">{deck.name}</h3>
                    <p className="text-sm text-muted">{deck.cardsCount} карточек</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg">{deck.progress}%</div>
                  </div>
                </div>

                <ProgressBar progress={deck.progress} color={deck.color} />

                <div className="mt-3 deck-levels">
                  <span className="text-muted">Уровни:</span>
                  <div className="deck-levels__list">
                    <span>0: {Math.round(deck.cardsCount * 0.3)}</span>
                    <span>1: {Math.round(deck.cardsCount * 0.3)}</span>
                    <span>2: {Math.round(deck.cardsCount * 0.2)}</span>
                    <span>3: {Math.round(deck.cardsCount * 0.2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h3 className="mb-4">Достижения</h3>
          <div className="achievements-grid">
            {statistics.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`achievement ${achievement.unlocked ? '' : 'achievement--locked'}`}
              >
                <div className="achievement__icon">
                  {achievement.icon === 'trophy' && <Trophy size={24} className="text-white" />}
                  {achievement.icon === 'target' && <Target size={24} className="text-white" />}
                  {achievement.icon === 'zap' && <Zap size={24} className="text-white" />}
                </div>
                <span className="text-xs">{achievement.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
