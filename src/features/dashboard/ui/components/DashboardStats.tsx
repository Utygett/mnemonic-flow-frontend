import React from 'react';
import { Clock, BookOpen, Flame } from 'lucide-react';
import type { Statistics } from '../../../../types';

export function DashboardStats({ statistics }: { statistics: Statistics }) {
  return (
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
  );
}
