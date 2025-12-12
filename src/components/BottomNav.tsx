import React from 'react';
import { Home, BookOpen, BarChart3, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'study' | 'stats' | 'profile';
  onTabChange: (tab: 'home' | 'study' | 'stats' | 'profile') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home' as const, icon: Home, label: 'Главная' },
    { id: 'study' as const, icon: BookOpen, label: 'Обучение' },
    { id: 'stats' as const, icon: BarChart3, label: 'Статистика' },
    { id: 'profile' as const, icon: User, label: 'Профиль' },
  ];
  
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav__inner">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`bottom-nav__item ${activeTab === id ? 'bottom-nav__item--active' : ''}`}
          >
            <Icon size={24} strokeWidth={2} />
            <span className="bottom-nav__label">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}