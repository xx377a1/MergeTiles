import React, { useRef, useEffect } from 'react';
import { Tile, MoveDirection } from '../types/game';
import { TileItem } from './TileItem';

interface GameBoardProps {
  tiles: Tile[];
  onMove: (direction: MoveDirection) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ tiles, onMove }) => {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const touchEndPos = useRef<{ x: number; y: number } | null>(null);
  const isSwiping = useRef<boolean>(false);

  const MIN_SWIPE_DISTANCE = 30;

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartPos.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        touchEndPos.current = null;
        isSwiping.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping.current || !touchStartPos.current) return;
      e.preventDefault();
      touchEndPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const handleTouchEnd = () => {
      if (!isSwiping.current || !touchStartPos.current || !touchEndPos.current) {
        isSwiping.current = false;
        return;
      }

      const dx = touchEndPos.current.x - touchStartPos.current.x;
      const dy = touchEndPos.current.y - touchStartPos.current.y;

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) >= MIN_SWIPE_DISTANCE) {
        if (absDx > absDy) {
          onMove(dx > 0 ? 'RIGHT' : 'LEFT');
        } else {
          onMove(dy > 0 ? 'DOWN' : 'UP');
        }
      }

      touchStartPos.current = null;
      touchEndPos.current = null;
      isSwiping.current = false;
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onMove]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
        case 'h':
        case 'H':
          onMove('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
        case 'l':
        case 'L':
          onMove('RIGHT');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case 'k':
        case 'K':
          onMove('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
        case 'j':
        case 'J':
          onMove('DOWN');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMove]);

  const bgCells = Array.from({ length: 16 });

  return (
    <div className="w-full max-w-md mx-auto px-2 my-2">
      <div
        ref={boardRef}
        className="w-full aspect-square bg-[#bbada0] rounded-xl sm:rounded-2xl p-2 sm:p-2.5 relative glow-board-classic overflow-hidden touch-none select-none"
      >
        {/* 4x4 Empty Grid Cells */}
        <div className="w-full h-full grid grid-cols-4 grid-rows-4 gap-2 sm:gap-2.5">
          {bgCells.map((_, i) => (
            <div
              key={i}
              className="w-full h-full bg-[#cdc1b4] rounded-md sm:rounded-lg"
            />
          ))}
        </div>

        {/* Active Number Tiles Layer */}
        <div className="absolute inset-2 sm:inset-2.5">
          {tiles.map((tile) => (
            <TileItem key={tile.id} tile={tile} />
          ))}
        </div>
      </div>
    </div>
  );
};
