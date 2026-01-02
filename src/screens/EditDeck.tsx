import React, { useEffect, useState } from 'react';
import { ApiClient } from '../api/client';
import { Button } from '../components/Button/Button';

export function EditDeck({
  deckId,
  onCancel,
  onSaved,
}: {
  deckId: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const cards_with_deck = await ApiClient.getDeckWithCards(deckId);
        const deck = cards_with_deck.deck;
        setTitle(deck.title ?? deck.name ?? '');
        setDescription(deck.description ?? '');
        setIsPublic(deck.is_public ?? false);
      } catch (e: any) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [deckId]);

  const submit = async () => {
    const t = title.trim();
    if (!t) return;

    try {
      setSaving(true);
      setError(null);
      await ApiClient.updateDeck(deckId, { title: t, description: description || null, is_public: isPublic });
      onSaved();
    } catch (e) {
      setError('Не удалось обновить колоду');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-dark flex items-center justify-center">Загрузка…</div>;
  }

  return (
    <div className="min-h-screen bg-dark p-4">
      <div className="container-centered max-w-390">
        <div className="card">
          <h2 className="page__title">Редактировать колоду</h2>

          <label className="field">
            <div className="field__label">Название</div>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название колоды"
              maxLength={60}
            />
          </label>
            <label className="form-row">
            <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
            />
            <span style={{ marginLeft: 8 }}>Сделать колоду публичной</span>
            </label>
          <label className="field">
            <div className="field__label">Описание</div>
            <textarea
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание (опционально)"
            />
          </label>

          {error && <div className="text-error">{error}</div>}

          <div className="actions">
            <button className="btn-ghost" onClick={onCancel} disabled={saving}>
              Отмена
            </button>
            <button className="btn-primary" onClick={submit} disabled={saving || !title.trim()}>
              {saving ? 'Сохранение…' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
