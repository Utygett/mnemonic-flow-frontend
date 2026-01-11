import React from 'react';

import type { PublicDeckSummary } from '../model/types';

import styles from './DeckCard.module.css';

type Props = {
  deck: PublicDeckSummary;
  onClick: () => void;
  onEdit?: () => void;
};

export function DeckCard({ deck, onClick, onEdit }: Props) {
  return (
    <div className={styles.root}>
      <button type="button" onClick={onClick} className={styles.clickArea}>
        <div className={styles.headerRow}>
          <div className={styles.title}>{deck.title}</div>
          {typeof deck.cards_count === 'number' ? <div className={styles.count}>{deck.cards_count}</div> : null}
        </div>
        {deck.description ? <div className={styles.description}>{deck.description}</div> : null}
      </button>

      {onEdit ? (
        <div className={styles.editRow}>
          <button type="button" className={styles.editButton} onClick={onEdit}>
            Редактировать
          </button>
        </div>
      ) : null}
    </div>
  );
}
