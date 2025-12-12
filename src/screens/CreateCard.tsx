import React, { useState } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { LevelIndicator } from '../components/LevelIndicator';
import { X, Plus, Trash2 } from 'lucide-react';

interface CreateCardProps {
  onSave: (cardData: any) => void;
  onCancel: () => void;
}

export function CreateCard({ onSave, onCancel }: CreateCardProps) {
  const [term, setTerm] = useState('');
  const [activeLevel, setActiveLevel] = useState(0);
  const [levels, setLevels] = useState<string[]>(['']); // Начинаем с одного уровня
  
  const levelDescriptions = [
    'Простое определение',
    'Развернутое определение',
    'Контекстный вопрос',
    'Сложная задача',
    'Применение на практике',
    'Анализ и синтез',
    'Критическое мышление',
    'Экспертный уровень',
    'Мастерство',
    'Инновации',
  ];
  
  const handleAddLevel = () => {
    if (levels.length < 10) {
      setLevels([...levels, '']);
      setActiveLevel(levels.length);
    }
  };
  
  const handleRemoveLevel = (index: number) => {
    if (levels.length > 1) {
      const newLevels = levels.filter((_, i) => i !== index);
      setLevels(newLevels);
      if (activeLevel >= newLevels.length) {
        setActiveLevel(newLevels.length - 1);
      }
    }
  };
  
  const handleLevelChange = (index: number, value: string) => {
    const newLevels = [...levels];
    newLevels[index] = value;
    setLevels(newLevels);
  };
  
  const handleSave = () => {
    // Проверяем, что хотя бы первый уровень заполнен
    if (term && levels[0]) {
      onSave({ term, levels: levels.filter(l => l.trim() !== '') });
    }
  };
  
  return (
    <div className="min-h-screen bg-dark pb-24">
      {/* Header */}
      <div className="page__header" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="page__header-inner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={onCancel} style={{ color: '#9CA3AF', background: 'transparent', border: 0 }}>
              <X size={24} />
            </button>
            <h2 style={{ color: '#E8EAF0' }}>Новая карточка</h2>
            <div style={{ width: 24 }} />
          </div>
        </div>
  </div>
  <main className="container-centered max-w-390 space-y-6 py-6">
        {/* Term Input */}
        <Input
          value={term}
          onChange={setTerm}
          label="Термин / Вопрос"
          placeholder="Например: Фотосинтез"
        />
        
        {/* Level Tabs */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#E8EAF0' }}>
              Уровни сложности ({levels.length})
            </label>
            {levels.length < 10 && (
              <button onClick={handleAddLevel} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4A6FA5', background: 'transparent', border: 0 }}>
                <Plus size={16} />
                Добавить уровень
              </button>
            )}
          </div>

          <div className="level-tabs">
            {levels.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveLevel(index)}
                className={`level-tab ${activeLevel === index ? 'level-tab--active' : 'level-tab--inactive'}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.875rem' }}>Уровень {index + 1}</span>
                </div>
              </button>
            ))}
          </div>
          
          {/* Level Content */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <span className="text-sm text-[#9CA3AF]">
                  {levelDescriptions[activeLevel] || `Уровень ${activeLevel + 1}`}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <LevelIndicator currentLevel={Math.min(activeLevel, 3) as 0 | 1 | 2 | 3} size="small" />
                {levels.length > 1 && (
                  <button onClick={() => handleRemoveLevel(activeLevel)} style={{ color: '#E53E3E', padding: 4, background: 'transparent', border: 0 }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
            
            <Input
              value={levels[activeLevel]}
              onChange={(value) => handleLevelChange(activeLevel, value)}
              placeholder={`Введите содержание для уровня ${activeLevel + 1}`}
              multiline
              rows={5}
            />
          </div>
        </div>
        
        {/* Preview */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem', color: '#E8EAF0' }}>Предпросмотр</label>
          <div className="card" style={{ padding: '1.5rem', minHeight: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {term ? (
              <>
                <LevelIndicator currentLevel={0} size="medium" />
                <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '1.125rem', color: '#E8EAF0' }}>{term}</p>
                {levels[0] && (
                  <p style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#9CA3AF' }}>
                    {levels[0].substring(0, 50)}{levels[0].length > 50 ? '...' : ''}
                  </p>
                )}
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{levels.filter(l => l.trim() !== '').length} уровней</span>
                </div>
              </>
            ) : (
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Предпросмотр появится после заполнения</p>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem' }}>
          <Button onClick={onCancel} variant="secondary" size="large" fullWidth>
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
            size="large"
            fullWidth
            disabled={!term || !levels[0]}
          >
            Сохранить
          </Button>
        </div>
      </main>
    </div>
  );
}
