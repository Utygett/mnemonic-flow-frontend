import React from 'react';
import { Statistics as StatsType, Deck } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import { Trophy, Target, Zap } from 'lucide-react';

interface StatisticsProps {
  statistics: StatsType;
  decks: Deck[];
}

export function Statistics({ statistics, decks }: StatisticsProps) {
  const totalProgress = decks.reduce((acc, deck) => acc + deck.progress, 0) / decks.length;
  
  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-6 shadow-sm">
        <div className="max-w-[390px] mx-auto">
          <h1 className="mb-6">Статистика</h1>
          
          {/* Overall Progress Circle */}
          <div className="flex flex-col items-center py-6">
            <div className="relative w-40 h-40">
              <svg className="transform -rotate-90 w-40 h-40">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                  fill="none"
                />
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
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-1">{Math.round(totalProgress)}%</div>
                  <div className="text-sm text-[#718096]">Общий прогресс</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-6 max-w-[390px] mx-auto space-y-6">
        {/* Weekly Activity */}
        <div className="bg-white rounded-xl p-4">
          <h3 className="mb-4">Активность за неделю</h3>
          <div className="flex items-end justify-between gap-2 h-32">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => {
              const value = statistics.weeklyActivity[index] || 0;
              const maxValue = Math.max(...statistics.weeklyActivity, 1);
              const height = (value / maxValue) * 100;
              
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-[#F5F7FA] rounded-t-lg relative overflow-hidden" style={{ height: '100px' }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-[#4A6FA5] rounded-t-lg transition-all duration-300"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#718096]">{day}</span>
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
              <div key={deck.id} className="bg-white rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-base">{deck.name}</h3>
                    <p className="text-sm text-[#718096]">{deck.cardsCount} карточек</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg">{deck.progress}%</div>
                  </div>
                </div>
                
                <ProgressBar progress={deck.progress} color={deck.color} />
                
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-[#718096]">Уровни:</span>
                  <div className="flex gap-3">
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
          <div className="grid grid-cols-3 gap-3">
            {statistics.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`bg-white rounded-xl p-4 flex flex-col items-center text-center ${
                  achievement.unlocked ? '' : 'opacity-40'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-[#FF9A76] flex items-center justify-center mb-2">
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
