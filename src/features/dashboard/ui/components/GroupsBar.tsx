import React from 'react';
import { Trash2 } from 'lucide-react';
import type { Group } from '../../../../types';

import { useGroupsCarousel } from '../../model/useGroupsCarousel';

type Props = {
  groups: Group[];
  activeGroupId: string | null;
  onGroupChange: (id: string) => void;
  onCreateGroup: () => void;
  onDeleteActiveGroup: () => void;
};

export function GroupsBar({
  groups,
  activeGroupId,
  onGroupChange,
  onCreateGroup,
  onDeleteActiveGroup,
}: Props) {
  const { carouselRef, onWheelCarousel, onMouseDown, onMouseMove, onMouseUpOrLeave } =
    useGroupsCarousel();

  const safeGroups = groups ?? [];

  return (
    <div className="groups-section">
      <div className="groups-container">
        <button className="groups-button groups-button-add" onClick={onCreateGroup}>
          +
        </button>

        <div className="groups-carousel-wrapper">
          {safeGroups.length === 0 ? (
            <p className="groups-empty-message">Создайте первую группу</p>
          ) : (
            <div
              ref={carouselRef}
              className="groups-carousel"
              onWheel={onWheelCarousel}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUpOrLeave}
              onMouseLeave={onMouseUpOrLeave}
            >
              {safeGroups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={'group-pill' + (g.id === activeGroupId ? ' group-pill--active' : '')}
                  onClick={() => onGroupChange(g.id)}
                >
                  {g.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className="groups-button groups-button-delete"
          onClick={onDeleteActiveGroup}
          disabled={!activeGroupId}
          title={!activeGroupId ? 'Нет активной группы' : 'Удалить группу'}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
