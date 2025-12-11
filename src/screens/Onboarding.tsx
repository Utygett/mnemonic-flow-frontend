import React, { useState } from 'react';
import { Button } from '../components/Button';
import { LevelIndicator } from '../components/LevelIndicator';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: 'Добро пожаловать в AdaptiveRecall',
      description: 'Учитесь эффективно с карточками, которые растут вместе с вами',
      image: '📚',
    },
    {
      title: '4 уровня мастерства',
      description: 'Каждая карточка проходит путь от знакомства до полного освоения',
      image: '🎯',
    },
    {
      title: 'Начните прямо сейчас',
      description: 'Создайте свою первую колоду и начните путь к знаниям',
      image: '🚀',
    },
  ];
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  
  const handleSkip = () => {
    onComplete();
  };
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Skip Button */}
      <div className="px-4 pt-12 pb-4">
        <div className="max-w-[390px] mx-auto flex justify-end">
          <button
            onClick={handleSkip}
            className="text-[#718096] text-sm"
          >
            Пропустить
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="max-w-[390px] w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {/* Illustration */}
              <div className="text-8xl mb-8">
                {steps[currentStep].image}
              </div>
              
              {/* Title */}
              <h1 className="mb-4">
                {steps[currentStep].title}
              </h1>
              
              {/* Description */}
              <p className="text-[#718096] mb-8">
                {steps[currentStep].description}
              </p>
              
              {/* Level Demo (only on step 1) */}
              {currentStep === 1 && (
                <div className="bg-[#F5F7FA] rounded-xl p-6 mb-8">
                  <div className="space-y-4">
                    {[0, 1, 2, 3].map((level) => (
                      <div key={level} className="flex items-center justify-between">
                        <span className="text-sm">Уровень {level}</span>
                        <LevelIndicator currentLevel={level as 0 | 1 | 2 | 3} size="medium" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="px-4 pb-8">
        <div className="max-w-[390px] mx-auto">
          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-[#4A6FA5] w-8'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          {/* Next Button */}
          <Button onClick={handleNext} variant="primary" size="large" fullWidth>
            {currentStep < steps.length - 1 ? 'Далее' : 'Начать'}
          </Button>
        </div>
      </div>
    </div>
  );
}
