import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Предотвращаем стандартный браузерный промпт
      e.preventDefault();
      // Сохраняем событие для использования позже
      setDeferredPrompt(e);
      // Показываем наш кастомный промпт
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Показываем промпт установки
    deferredPrompt.prompt();

    // Ждем выбора пользователя
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response: ${outcome}`);

    // Очищаем сохраненный промпт
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-50 max-w-[390px] mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-[#4A6FA5] rounded-xl flex items-center justify-center">
                <Download size={24} className="text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-base mb-1">Установить приложение</h3>
                <p className="text-sm text-[#718096] mb-3">
                  Добавьте AdaptiveRecall на главный экран для быстрого доступа
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleInstall}
                    className="flex-1 bg-[#4A6FA5] text-white px-4 py-2 rounded-lg text-sm active:bg-[#3a5a8a] transition-colors"
                  >
                    Установить
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-2 text-[#718096] text-sm"
                  >
                    Позже
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-[#718096]"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
