import { useMemo, useState } from 'react';

import { ApiClient } from '@/shared/api';

import type { CreateDeckProps } from './types';

export type CreateDeckViewModel = {
  title: string;
  setTitle: (v: string) => void;

  saving: boolean;
  error: string | null;

  canSubmit: boolean;
  submit: () => Promise<void>;
};

export function useCreateDeckModel(props: CreateDeckProps): CreateDeckViewModel {
  const { onSave } = props;

  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => Boolean(title.trim()) && !saving, [title, saving]);

  const submit = async () => {
    const t = title.trim();
    if (!t) return;

    try {
      setSaving(true);
      setError(null);
      const created = await ApiClient.createDeck({ title: t });
      onSave((created as any).id);
    } catch (e) {
      console.error(e);
      setError('Не удалось создать колоду');
    } finally {
      setSaving(false);
    }
  };

  return {
    title,
    setTitle,
    saving,
    error,
    canSubmit,
    submit,
  };
}
