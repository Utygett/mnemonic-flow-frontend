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

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const deck = await ApiClient.getDeckWithCards(deckId);
        setTitle(deck.title ?? deck.name ?? '');
        setDescription(deck.description ?? '');
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
      await ApiClient.updateDeck(deckId, { title: t, description: description || null });
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
