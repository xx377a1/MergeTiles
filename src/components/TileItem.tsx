import React from 'react';
import { Tile } from '../types/game';
import { getTileStyle } from '../utils/tileStyles';

interface TileItemProps {
  tile: Tile;
}

export const TileItem: React.FC<TileItemProps> = ({ tile }) => {
  const style = getTileStyle(tile.value);

  // Position coordinates on the 4x4 grid (percentages)
  const topPercent = tile.row * 25;
  const leftPercent = tile.col * 25;

  let animClass = '';
  if (tile.isNew) {
    animClass = 'animate-tile-pop';
  } else if (tile.isMerged) {
    animClass = 'animate-tile-merge';
  }

  return (
    <div
      className="absolute p-1 sm:p-1.5 transition-all duration-150 ease-out z-10"
      style={{
        top: `${topPercent}%`,
        left: `${leftPercent}%`,
        width: '25%',
        height: '25%',
      }}
    >
      <div
        className={`w-full h-full rounded-md sm:rounded-lg flex items-center justify-center relative overflow-hidden transition-all duration-150 ${style.bgClass} ${style.glowClass || ''} ${animClass}`}
      >
        {/* Value Text */}
        <span
          className={`relative z-10 select-none font-bold text-center leading-none ${style.textClass} ${style.fontSizeClass}`}
        >
          {tile.value}
        </span>
      </div>
    </div>
  );
};
