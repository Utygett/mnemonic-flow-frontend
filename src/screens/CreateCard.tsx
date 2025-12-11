import React, { useState } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { LevelIndicator } from '../components/LevelIndicator';
import { X } from 'lucide-react';

interface CreateCardProps {
  onSave: (cardData: any) => void;
  onCancel: () => void;
}

export function CreateCard({ onSave, onCancel }: CreateCardProps) {
  const [term, setTerm] = useState('');
  const [activeLevel, setActiveLevel] = useState<0 | 1 | 2 | 3>(0);
  const [levels, setLevels] = useState({
    level0: '',
    level1: '',
    level2: '',
    level3: '',
  });
  
  const levelDescriptions = {
    0: 'Простое определение',
    1: 'Развернутое определение',
    2: 'Контекстный вопрос',
    3: 'Сложная задача',
  };
  
  const handleSave = () => {
    if (term && levels.level0) {
      onSave({ term, levels });
    }
  };
  
  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-[390px] mx-auto">
          <div className="flex justify-between items-center">
            <button onClick={onCancel} className="text-[#718096]">
              <X size={24} />
            </button>
            <h2>Новая карточка</h2>
            <div className="w-6" />
          </div>
        </div>
      </div>
      
      <div className="px-4 py-6 max-w-[390px] mx-auto space-y-6">
        {/* Term Input */}
        <Input
          value={term}
          onChange={setTerm}
          label="Термин / Вопрос"
          placeholder="Например: Фотосинтез"
        />
        
        {/* Level Tabs */}
        <div>
          <label className="block mb-3 text-sm text-[#2D3748]">
            Уровни сложности
          </label>
          
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {[0, 1, 2, 3].map((level) => (
              <button
                key={level}
                onClick={() => setActiveLevel(level as 0 | 1 | 2 | 3)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg transition-colors ${
                  activeLevel === level
                    ? 'bg-[#4A6FA5] text-white'
                    : 'bg-white text-[#718096] border-2 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">Уровень {level}</span>
                </div>
              </button>
            ))}
          </div>
          
          {/* Level Content */}
          <div className="bg-white rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#718096]">
                {levelDescriptions[activeLevel]}
              </span>
              <LevelIndicator currentLevel={activeLevel} size="small" />
            </div>
            
            <Input
              value={levels[`level${activeLevel}` as keyof typeof levels]}
              onChange={(value) =>
                setLevels({
                  ...levels,
                  [`level${activeLevel}`]: value,
                })
              }
              placeholder={`Введите содержание для уровня ${activeLevel}`}
              multiline
              rows={5}
            />
          </div>
        </div>
        
        {/* Preview */}
        <div>
          <label className="block mb-3 text-sm text-[#2D3748]">
            Предпросмотр
          </label>
          <div className="bg-white rounded-xl p-6 shadow-sm min-h-[150px] flex flex-col items-center justify-center">
            {term ? (
              <>
                <LevelIndicator currentLevel={0} size="medium" />
                <p className="mt-4 text-center text-lg">{term}</p>
                {levels.level0 && (
                  <p className="mt-2 text-center text-sm text-[#718096]">
                    {levels.level0.substring(0, 50)}...
                  </p>
                )}
              </>
            ) : (
              <p className="text-[#718096] text-sm">
                Предпросмотр появится после заполнения
              </p>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button onClick={onCancel} variant="secondary" size="large" fullWidth>
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
            size="large"
            fullWidth
            disabled={!term || !levels.level0}
          >
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
}
