import React from 'react';

export function DecksActionsContainer({
  refreshDecks,
  closeCreateDeck,
  closeEditDeck,
  children,
}) {
  const onDeckCreated = () => {
    refreshDecks();
    closeCreateDeck();
  };

  const onDeckSaved = () => {
    refreshDecks();
    closeEditDeck();
  };

  return children({ onDeckCreated, onDeckSaved });
}
