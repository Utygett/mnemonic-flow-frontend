import React, { useState } from 'react';
import { ApiClient } from '../../api/client';

export function CreateGroup({
  onSave,
  onCancel,
}: {
  onSave: (createdGroupId?: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const t = title.trim();
    if (!t) return;

    try {
      setSaving(true);
      setError(null);

      const created = await ApiClient.createGroup({
        title: t,
        description: description.trim() || null,
        parent_id: null, // если позже добавишь выбор родителя — подставишь сюда
      });

      // created.id должен быть user_group_id (или нормализованный id)
      onSave(created?.id);
    } catch (e) {
      setError('Не удалось создать группу');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark p-4">
      <div className="container-centered max-w-390">
        <div className="card">
          <h2 className="page__title">Новая группа</h2>

          <label className="field">
            <div className="field__label">Название</div>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Мои колоды"
              maxLength={60}
              disabled={saving}
            />
          </label>

          <label className="field">
            <div className="field__label">Описание</div>
            <textarea
              className="input input--textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Необязательно"
              rows={3}
              disabled={saving}
            />
          </label>

          {error && <div className="text-error">{error}</div>}

          <div className="actions">
            <button className="btn-ghost" onClick={onCancel} disabled={saving}>
              Отмена
            </button>
            <button
              className="btn-primary"
              onClick={submit}
              disabled={saving || !title.trim()}
            >
              {saving ? 'Сохранение…' : 'Создать'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
