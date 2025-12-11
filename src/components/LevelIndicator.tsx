import React from 'react';

interface LevelIndicatorProps {
  currentLevel: 0 | 1 | 2 | 3;
  size?: 'small' | 'medium' | 'large';
}

export function LevelIndicator({ currentLevel, size = 'medium' }: LevelIndicatorProps) {
  const sizeClasses = {
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-4 h-4',
  };
  
  const gapClasses = {
    small: 'gap-1',
    medium: 'gap-1.5',
    large: 'gap-2',
  };
  
  return (
    <div className={`flex ${gapClasses[size]} items-center`}>
      {[0, 1, 2, 3].map((level) => (
        <div
          key={level}
          className={`${sizeClasses[size]} rounded-full transition-all duration-200 ${
            level <= currentLevel
              ? 'bg-[#4A6FA5]'
              : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  );
}
