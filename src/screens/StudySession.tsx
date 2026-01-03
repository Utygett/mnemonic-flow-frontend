import React, { useEffect, useState } from 'react';
import { StudyCard, DifficultyRating, isMultipleChoice } from '../types';
import { FlipCard } from '../components/FlipCard';
import { RatingButton } from '../components/RatingButton';
import { Button } from '../components/Button/Button';
import { ProgressBar } from '../components/ProgressBar';
import { X, SkipForward, Trash2 } from 'lucide-react';
import { MarkdownView } from '../components/MarkdownView';

function getLevelIndex(l: any): number {
  return typeof l?.level_index === 'number' ? l.level_index : l?.levelindex;
}

export function StudySession({
  cards,
  currentIndex,
  onRate,
  onClose,
  onLevelUp,
  onLevelDown,
  onSkip,
  onRemoveFromProgress,
}: {
  cards: StudyCard[];
  currentIndex: number;
  onRate: (rating: DifficultyRating) => void;
  onClose: () => void;
  onLevelUp: () => void;
  onLevelDown: () => void;
  onSkip: () => void;
  onRemoveFromProgress: () => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const currentCard = cards[currentIndex];
  if (!currentCard) {
    return (
      <div className="study-page flex items-center justify-center">
        <div className="text-muted">Карточки закончились</div>
      </div>
    );
  }

  const progress = (currentIndex / cards.length) * 100;

  const handleRate = (rating: DifficultyRating) => {
    setIsFlipped(false);
    setTimeout(() => onRate(rating), 300);
  };

  const handleFlip = () => setIsFlipped((v) => !v);

  const handleSkip = () => {
    setIsFlipped(false);
    onSkip();
  };

  const handleRemoveFromProgress = () => {
    const ok = window.confirm(
      'Удалить карточку из прогресса?\n\n' +
        'Она больше не будет отображаться в повторении. ' +
        'Вернуть её можно будет, начав изучение снова (прогресс начнётся заново).'
    );
    if (!ok) return;

    setIsFlipped(false);
    onRemoveFromProgress();
  };

  useEffect(() => {
    setIsFlipped(false);
    setSelectedOptionId(null);
  }, [currentCard?.id, currentCard?.activeLevel]);

  const level =
    (currentCard.levels as any[]).find((l) => getLevelIndex(l) === currentCard.activeLevel) ??
    currentCard.levels[0];

  const mcq = isMultipleChoice(currentCard) ? ((level as any)?.content as any) : null;
  const timerSec = typeof mcq?.timerSec === 'number' && mcq.timerSec > 0 ? mcq.timerSec : 0;

  useEffect(() => {
    if (!isMultipleChoice(currentCard)) return;
    if (isFlipped) return;
    if (!timerSec) return;

    const t = window.setTimeout(() => setIsFlipped(true), timerSec * 1000);
    return () => window.clearTimeout(t);
  }, [currentCard.id, currentCard.activeLevel, timerSec, isFlipped]);

  const renderMcqFront = () => {
    if (!mcq) return null;

    return (
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ marginBottom: 12 }}>
          <MarkdownView value={String(mcq.question ?? '')} />
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {(mcq.options ?? []).map((opt: any) => (
            <button
              key={opt.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedOptionId(String(opt.id));
                setIsFlipped(true);
              }}
              disabled={isFlipped}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(0,0,0,0.20)',
                color: 'inherit',
                cursor: isFlipped ? 'default' : 'pointer',
              }}
            >
              <MarkdownView value={String(opt.text ?? '')} />
            </button>
          ))}
        </div>

        {timerSec > 0 ? (
          <div style={{ marginTop: 12, opacity: 0.75, fontSize: 12 }}>Таймер: {timerSec}s</div>
        ) : null}
      </div>
    );
  };

  const renderMcqBack = () => {
    if (!mcq) return null;

    const options: any[] = mcq.options ?? [];
    const correct = options.find((o) => String(o.id) === String(mcq.correctOptionId));
    const selected = options.find((o) => String(o.id) === String(selectedOptionId));

    return (
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ opacity: 0.85, fontSize: 12, marginBottom: 6 }}>Правильный ответ</div>
          <MarkdownView value={String(correct?.text ?? '')} />
        </div>

        {selectedOptionId ? (
          <div style={{ marginBottom: 12 }}>
            <div style={{ opacity: 0.85, fontSize: 12, marginBottom: 6 }}>Вы выбрали</div>
            <MarkdownView value={String(selected?.text ?? '')} />
          </div>
        ) : null}

        {mcq.explanation ? (
          <div>
            <div style={{ opacity: 0.85, fontSize: 12, marginBottom: 6 }}>Пояснение</div>
            <MarkdownView value={String(mcq.explanation)} />
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="study-page">
      <div className="page__header py-4">
        <div className="page__header-inner">
          <div className="flex justify-between items-center mb-4">
            <button onClick={onClose} className="icon-btn" aria-label="Закрыть сессию" type="button">
              <X size={18} />
            </button>

            <span className="text-sm text-muted">
              {currentIndex + 1} / {cards.length}
            </span>

            <div className="flex items-center" style={{ columnGap: 32 }}>
              <button
                onClick={handleSkip}
                className="icon-btn"
                aria-label="Пропустить карточку"
                type="button"
              >
                <SkipForward size={18} />
              </button>

              <button
                onClick={handleRemoveFromProgress}
                className="icon-btn"
                aria-label="Удалить прогресс карточки"
                type="button"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <ProgressBar progress={progress} color="#FF9A76" />
        </div>
      </div>

      <div className="study__card-area">
        {isMultipleChoice(currentCard) ? (
          <FlipCard
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped((v) => !v)}
            disableFlipOnClick
            onLevelUp={onLevelUp}
            onLevelDown={onLevelDown}
            frontContent={renderMcqFront()}
            backContent={renderMcqBack()}
          />
        ) : (
          <FlipCard
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={handleFlip}
            onLevelUp={onLevelUp}
            onLevelDown={onLevelDown}
          />
        )}
      </div>

      <div className="study__actions">
        {!isFlipped ? (
          <Button onClick={handleFlip} variant="primary" size="large" fullWidth>
            Показать ответ
          </Button>
        ) : (
          <div className="study__actions-inner">
            <div className="rating-row">
              <RatingButton rating="again" label="Снова" onClick={() => handleRate('again')} />
              <RatingButton rating="hard" label="Трудно" onClick={() => handleRate('hard')} />
              <RatingButton rating="good" label="Хорошо" onClick={() => handleRate('good')} />
              <RatingButton rating="easy" label="Легко" onClick={() => handleRate('easy')} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
