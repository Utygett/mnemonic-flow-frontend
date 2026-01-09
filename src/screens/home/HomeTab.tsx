import React from 'react';
import type { Deck, Group, Statistics } from '../../types';
import type { PersistedSession } from '../../utils/sessionStore';
import { DashboardContainer } from '../dashboard/DashboardContainer';

type Props = {
  statistics: Statistics;
  decks: Deck[];
  groups: Group[];
  activeGroupId: string | null;

  resumeCandidate: PersistedSession | null;
  onResume: () => void;
  onDiscardResume: () => void;

  onGroupChange: (groupId: string | null) => void;
  onCreateGroup: () => void;
  onDeleteActiveGroup: () => void;

  onStartStudy: () => void;
  onDeckClick: (deckId: string) => void;
  onOpenEditDeck: (deckId: string) => void;
  onAddDeck: () => void;
};

export function HomeTab(props: Props) {
  return (
    <DashboardContainer
      statistics={props.statistics}
      decks={props.decks}
      groups={props.groups}
      activeGroupId={props.activeGroupId}
      resumeCandidate={props.resumeCandidate}
      onResume={props.onResume}
      onDiscardResume={props.onDiscardResume}
      onGroupChange={(id) => props.onGroupChange(id)}
      onCreateGroup={props.onCreateGroup}
      onDeleteActiveGroup={props.onDeleteActiveGroup}
      onStartStudy={props.onStartStudy}
      onDeckClick={props.onDeckClick}
      onOpenEditDeck={props.onOpenEditDeck}
      onAddDeck={props.onAddDeck}
    />
  );
}
