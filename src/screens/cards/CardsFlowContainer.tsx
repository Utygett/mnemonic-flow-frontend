import React from 'react';

export function CardsFlowContainer({ children }: { children: (api: any) => React.ReactNode }) {
  const [isCreatingCard, setIsCreatingCard] = React.useState(false);
  const [isEditingCard, setIsEditingCard] = React.useState(false);

  const api = {
    isCreatingCard,
    isEditingCard,
    openCreateCard: () => setIsCreatingCard(true),
    closeCreateCard: () => setIsCreatingCard(false),
    openEditCard: () => setIsEditingCard(true),
    closeEditCard: () => setIsEditingCard(false),
  };

  return <>{children(api)}</>;
}
