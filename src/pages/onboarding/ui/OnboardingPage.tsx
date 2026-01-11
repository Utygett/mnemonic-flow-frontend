import React, { useState } from 'react';

import { motion, AnimatePresence } from 'motion/react';

import { LevelIndicator } from '../../../components/LevelIndicator';
import { Button } from '../../../shared/ui/Button/Button';

interface OnboardingPageProps {
  onComplete: () => void;
}

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Добро пожаловать в MnemonicFlow',
      description: 'Учитесь эффективно с карточками, которые растут вместе с вами',
      image: '📚',
    },
    {
      title: 'Уровни мастерства',
      description: 'Каждая карточка проходит путь от знакомства до полного освоения',
      image: '🎯',
    },
    {
      title: 'Начните прямо сейчас',
      description: 'Создайте свою или выберите первую колоду и начните путь к знаниям',
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

  return (
    <div className="min-h-screen bg-dark layout-vertical-between">
      {/* Контент */}
      <div className="flex-1 center-vertical px-4">
        <div className="max-w-390 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="onboarding__image mb-8">{steps[currentStep].image}</div>

              <h1 className="onboarding__title mb-4">{steps[currentStep].title}</h1>

              <p className="onboarding__desc mb-8">{steps[currentStep].description}</p>

              {/* Level Demo (только на шаге 1) */}
              {currentStep === 1 && (
                <div className="onboarding__demo mb-8">
                  <div className="space-y-4">
                    {[0, 1, 2, 3].map((level) => (
                      <div key={level} className="onboarding__level-row">
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

      <div className="px-4 pb-8">
        <div className="container-centered">
          <div className="dots">
            {steps.map((_, index) => (
              <div key={index} className={`dot ${index === currentStep ? 'dot--active' : ''}`} />
            ))}
          </div>

          <div className="mt-4">
            <Button onClick={handleNext} variant="primary" size="large" fullWidth>
              {currentStep < steps.length - 1 ? 'Далее' : 'Начать'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
