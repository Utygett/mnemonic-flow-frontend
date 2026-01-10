import React from 'react';
import type { Deck } from '../../../../types';
import { DeckCard } from '../../../../components/DeckCard';

type Props = {
  decks: Deck[];
  onDeckClick: (deckId: string) => void;
  onEditDeck?: (deckId: string) => void;
};

export function DeckList({ decks, onDeckClick, onEditDeck }: Props) {
  return (
    <div className="p-4 container-centered max-w-390">
      <div className="space-y-3">
        {decks.map((deck) => (
          <DeckCard
            key={deck.deck_id}
            deck={deck}
            onClick={() => onDeckClick(deck.deck_id)}
            onEdit={onEditDeck ? () => onEditDeck(deck.deck_id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
