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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 pb-safe">
      <div className="max-w-[390px] mx-auto">
        <div className="flex justify-around items-center h-16">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center justify-center gap-1 min-w-[60px] transition-colors ${
                activeTab === id ? 'text-[#4A6FA5]' : 'text-[#718096]'
              }`}
            >
              <Icon size={24} strokeWidth={2} />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
