import React from 'react';

import type { PublicDeckSummary } from '../model/types';

import styles from './DeckCard.module.css';

type Props = {
  deck: PublicDeckSummary;
  onClick: () => void;
  onEdit?: () => void;
};

export function DeckCard({ deck, onClick, onEdit }: Props) {
  const description = deck.description?.trim();

  const totalCards = Number(deck.cards_count ?? 0);
  const completedCards = Number(deck.completed_cards_count ?? 0);
  const repetitionsCount = Number(deck.count_repeat ?? 0);
  const forRepetition = Number(deck.count_for_repeat ?? 0);

  const progress = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  const canEdit = Boolean(deck.can_edit && onEdit);

  return (
    <div className={styles.root}>
      <button type="button" onClick={onClick} className={styles.clickArea}>
        <div className={styles.headerRow}>
          <div className={styles.title}>{deck.title}</div>
          <div className={styles.countBadge} title="Всего карточек">
            {totalCards}
          </div>
        </div>

        <div className={styles.descriptionBox}>
          <div className={styles.description}>{description ? description : 'Описание отсутствует'}</div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.stat}>Прогресс: {progress}%</div>
          <div className={styles.stat}>Повторений: {repetitionsCount}</div>
          <div className={styles.stat}>Для повтора: {forRepetition}</div>
        </div>

        <div className={styles.progressWrap}>
          <div className={styles.progressBar} aria-label={`Прогресс ${progress}%`}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            <div className={styles.progressTextInBar}>
              {completedCards} / {totalCards}
            </div>
          </div>
        </div>
      </button>

      {canEdit ? (
        <div className={styles.editRow}>
          <button type="button" className={styles.editButton} onClick={onEdit}>
            Редактировать
          </button>
        </div>
      ) : null}
    </div>
  );
}
