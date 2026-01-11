import React from 'react';

import type { PublicDeckSummary } from '../model/types';

type Props = {
  deck: PublicDeckSummary;
  onClick: () => void;
  onEdit?: () => void;
};

export function DeckCard({ deck, onClick, onEdit }: Props) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <button type="button" onClick={onClick} className="w-full text-left">
        <div className="flex items-center justify-between">
          <div style={{ fontWeight: 600 }}>{deck.title}</div>
          {typeof deck.cards_count === 'number' ? (
            <div className="text-muted text-sm">{deck.cards_count}</div>
          ) : null}
        </div>
        {deck.description ? <div className="text-muted text-sm mt-1">{deck.description}</div> : null}
      </button>

      {onEdit ? (
        <div className="mt-2">
          <button type="button" className="text-sm underline opacity-80" onClick={onEdit}>
            Редактировать
          </button>
        </div>
      ) : null}
    </div>
  );
}
