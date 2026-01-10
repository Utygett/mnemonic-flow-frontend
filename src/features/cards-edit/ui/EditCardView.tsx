// src/features/cards-edit/ui/EditCardView.tsx
import React from 'react';
import { X, Plus, Trash2, ChevronUp, ChevronDown, Pencil } from 'lucide-react';

import { Button } from '../../../shared/ui/Button/Button';
import { MarkdownField } from '../../../shared/ui/MarkdownField';

import type { EditCardViewModel } from '../model/useEditCardModel';

type Props = EditCardViewModel & {
  onCancel: () => void;
};

export function EditCardView(props: Props) {
  const {
    decks,
    deckId,
    setDeckId,

    loading,
    saving,
    errorText,

    cards,
    selectedCardId,
    setSelectedCardId,
    selectedCard,

    titleDraft,
    setTitleDraft,

    activeLevel,
    setActiveLevel,
    levels,

    qPreview,
    setQPreview,
    aPreview,
    setAPreview,

    cleanedCount,
    canSave,

    addLevel,
    removeLevel,
    moveLevel,

    addOption,
    removeOption,
    patchOptionText,
    moveOption,

    patchLevel,

    saveCard,
    deleteSelectedCard,
    deleteCurrentDeck,

    isOwnerOfCurrentDeck,
    onEditDeck,

    onCancel,
  } = props;

  const active = levels[activeLevel];

  return (
    <div className="min-h-screen bg-dark pb-24">
      <div className="page__header" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="page__header-inner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={onCancel} style={{ color: '#9CA3AF', background: 'transparent', border: 0 }}>
              <X size={24} />
            </button>
            <h2 style={{ color: '#E8EAF0' }}>Редактирование уровней</h2>
            <div style={{ width: 24 }} />
          </div>
        </div>
      </div>

      <main className="container-centered max-w-390 space-y-6 py-6">
        {errorText && (
          <div className="card" style={{ border: '1px solid rgba(229,62,62,0.4)' }}>
            <div style={{ color: '#FEB2B2' }}>{errorText}</div>
          </div>
        )}

        {/* Deck */}
        <div className="form-row">
          <label className="form-label">Колода</label>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={deckId}
              onChange={(e) => setDeckId(e.target.value)}
              className="input"
              disabled={decks.length === 0 || saving}
              style={{ flex: 1 }}
            >
              {decks.length === 0 ? (
                <option value="">Нет доступных колод</option>
              ) : (
                decks.map((d) => (
                  <option key={d.deck_id} value={d.deck_id}>
                    {d.title}
                  </option>
                ))
              )}
            </select>

            <button
              onClick={deleteCurrentDeck}
              disabled={!deckId || decks.length === 0 || saving}
              title="Удалить колоду"
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                border: '1px solid rgba(229,62,62,0.35)',
                background: 'transparent',
                color: '#E53E3E',
                opacity: !deckId || decks.length === 0 || saving ? 0.4 : 1,
              }}
            >
              <Trash2 size={18} />
            </button>

            {isOwnerOfCurrentDeck && onEditDeck && deckId ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditDeck(deckId);
                }}
                title="Редактировать колоду"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  border: '1px solid rgba(156,163,175,0.12)',
                  background: 'transparent',
                  color: '#E8EAF0',
                }}
              >
                <Pencil size={18} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Card */}
        <div className="form-row">
          <label className="form-label">Карточка</label>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
              className="input"
              disabled={loading || cards.length === 0 || saving}
              style={{ flex: 1 }}
            >
              <option value="">{loading ? 'Загрузка…' : 'Выбери карточку'}</option>
              {cards.map((c) => (
                <option key={c.card_id} value={c.card_id}>
                  {c.title}
                </option>
              ))}
            </select>

            <button
              onClick={deleteSelectedCard}
              disabled={!selectedCard || saving}
              title="Удалить карточку"
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                border: '1px solid rgba(229,62,62,0.35)',
                background: 'transparent',
                color: '#E53E3E',
                opacity: !selectedCard || saving ? 0.4 : 1,
              }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {!selectedCard ? null : (
          <>
            <div className="form-row">
              <label className="form-label">Название</label>
              <input
                className="input"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                disabled={!selectedCardId || saving}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.875rem', color: '#E8EAF0' }}>Уровни ({levels.length})</label>

                {levels.length < 10 && (
                  <button
                    onClick={addLevel}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4A6FA5', background: 'transparent', border: 0 }}
                  >
                    <Plus size={16} />
                    Добавить уровень
                  </button>
                )}
              </div>

              <div className="level-tabs">
                {levels.map((_, index) => {
                  const isActive = activeLevel === index;

                  return (
                    <div
                      key={index}
                      onClick={() => setActiveLevel(index)}
                      className={`level-tab ${isActive ? 'level-tab--active' : 'level-tab--inactive'}`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setActiveLevel(index);
                      }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}
                    >
                      <span style={{ fontSize: '0.875rem' }}>Уровень {index + 1}</span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            moveLevel(index, index - 1);
                          }}
                          title="Вверх"
                          style={{
                            display: 'inline-flex',
                            padding: 4,
                            color: '#9CA3AF',
                            opacity: index === 0 ? 0.35 : 1,
                            pointerEvents: index === 0 ? 'none' : 'auto',
                          }}
                        >
                          <ChevronUp size={16} />
                        </span>

                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            moveLevel(index, index + 1);
                          }}
                          title="Вниз"
                          style={{
                            display: 'inline-flex',
                            padding: 4,
                            color: '#9CA3AF',
                            opacity: index === levels.length - 1 ? 0.35 : 1,
                            pointerEvents: index === levels.length - 1 ? 'none' : 'auto',
                          }}
                        >
                          <ChevronDown size={16} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="card">
                {/* QA */}
                {active.kind === 'qa' ? (
                  <>
                    <MarkdownField
                      label="Вопрос"
                      value={active.question}
                      onChange={(v) => patchLevel(activeLevel, { question: v } as any)}
                      preview={qPreview}
                      onTogglePreview={() => setQPreview((p) => !p)}
                      disabled={saving}
                    />

                    <MarkdownField
                      label="Ответ"
                      value={active.answer}
                      onChange={(v) => patchLevel(activeLevel, { answer: v } as any)}
                      preview={aPreview}
                      onTogglePreview={() => setAPreview((p) => !p)}
                      disabled={saving}
                      className="mt-4"
                    />
                  </>
                ) : (
                  /* MCQ */
                  <>
                    <MarkdownField
                      label="Вопрос"
                      value={active.question}
                      onChange={(v) => patchLevel(activeLevel, { question: v } as any)}
                      preview={qPreview}
                      onTogglePreview={() => setQPreview((p) => !p)}
                      disabled={saving}
                    />

                    <div style={{ marginTop: 12 }}>
                      <label className="form-label">Варианты</label>

                      {active.options.map((o, i) => (
                        <div key={o.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                          <input
                            className="input"
                            value={o.text}
                            onChange={(e) => patchOptionText(i, e.target.value)}
                            disabled={saving}
                            placeholder={`Вариант ${i + 1}`}
                            style={{ flex: 1 }}
                          />

                          <button
                            onClick={() => moveOption(i, i - 1)}
                            disabled={i === 0 || saving}
                            title="Вверх"
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 10,
                              border: '1px solid rgba(156,163,175,0.12)',
                              background: 'transparent',
                              color: '#9CA3AF',
                              opacity: i === 0 || saving ? 0.35 : 1,
                            }}
                          >
                            <ChevronUp size={16} />
                          </button>

                          <button
                            onClick={() => moveOption(i, i + 1)}
                            disabled={i === active.options.length - 1 || saving}
                            title="Вниз"
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 10,
                              border: '1px solid rgba(156,163,175,0.12)',
                              background: 'transparent',
                              color: '#9CA3AF',
                              opacity: i === active.options.length - 1 || saving ? 0.35 : 1,
                            }}
                          >
                            <ChevronDown size={16} />
                          </button>

                          <button
                            onClick={() => removeOption(i)}
                            disabled={active.options.length <= 2 || saving}
                            title="Удалить вариант"
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 10,
                              border: '1px solid rgba(229,62,62,0.35)',
                              background: 'transparent',
                              color: '#E53E3E',
                              opacity: active.options.length <= 2 || saving ? 0.35 : 1,
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={addOption}
                        disabled={saving || active.options.length >= 8}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4A6FA5', background: 'transparent', border: 0 }}
                      >
                        <Plus size={16} />
                        Добавить вариант
                      </button>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <label className="form-label">Правильный вариант</label>
                      <select
                        className="input"
                        value={active.correctOptionId}
                        onChange={(e) => patchLevel(activeLevel, { correctOptionId: e.target.value } as any)}
                        disabled={saving}
                      >
                        <option value="">— выбери —</option>
                        {active.options.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.text || o.id}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <label className="form-label">Таймер (сек)</label>
                      <input
                        className="input"
                        type="number"
                        min={0}
                        value={active.timerSec}
                        onChange={(e) => patchLevel(activeLevel, { timerSec: Number(e.target.value) || 0 } as any)}
                        disabled={saving}
                      />
                      <div style={{ color: '#9CA3AF', fontSize: '0.8rem', marginTop: 6 }}>
                        0 = без таймера (карточка не будет автопереворачиваться по времени).
                      </div>
                    </div>

                    <MarkdownField
                      label="Пояснение (показывать на обороте)"
                      value={active.explanation}
                      onChange={(v) => patchLevel(activeLevel, { explanation: v } as any)}
                      preview={aPreview}
                      onTogglePreview={() => setAPreview((p) => !p)}
                      disabled={saving}
                      className="mt-4"
                    />
                  </>
                )}
              </div>

              {levels.length !== cleanedCount && (
                <div className="card">
                  <div style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                    Пустые уровни (недозаполненные) не будут сохранены.
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem' }}>
              <Button onClick={onCancel} variant="secondary" size="large" fullWidth disabled={saving}>
                Отмена
              </Button>
              <Button onClick={saveCard} variant="primary" size="large" fullWidth disabled={!canSave}>
                {saving ? 'Сохранение…' : 'Сохранить'}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
