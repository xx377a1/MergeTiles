import React from 'react';
import { AlertCircle, RotateCcw, RefreshCw } from 'lucide-react';
import { sound } from '../utils/sound';

interface GameOverModalProps {
  score: number;
  bestScore: number;
  highestTile: number;
  undoCount: number;
  onUndo: () => void;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  bestScore,
  highestTile,
  undoCount,
  onUndo,
  onRestart,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#776e65]/60 backdrop-blur-sm animate-fade-in font-2048">
      <div className="w-full max-w-sm bg-[#faf8ef] border-2 border-[#bbada0] rounded-2xl p-6 text-center shadow-2xl relative overflow-hidden">
        <div className="inline-flex p-3 rounded-full bg-[#eee4da] text-[#776e65] mb-2">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h2 className="font-black text-3xl text-[#776e65] mb-1">
          GAME OVER!
        </h2>
        <p className="text-xs text-[#8f7a66] font-medium mb-5">
          No further moves or merges are possible.
        </p>

        <div className="bg-[#bbada0] rounded-xl p-3 mb-6 grid grid-cols-3 gap-2 text-white">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-[#eee4da]">
              Score
            </div>
            <div className="font-bold text-base font-num truncate">
              {score.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-[#eee4da]">
              Best
            </div>
            <div className="font-bold text-base font-num truncate">
              {bestScore.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-[#eee4da]">
              Highest
            </div>
            <div className="font-bold text-base font-num truncate">
              {highestTile}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {undoCount > 0 && (
            <button
              onClick={() => {
                sound.playClick();
                onUndo();
              }}
              className="w-full py-3 px-4 rounded-lg font-bold text-xs uppercase text-white bg-[#8f7a66] hover:bg-[#9f8a76] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Undo Last Move</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-3 px-4 rounded-lg font-bold text-xs uppercase text-[#776e65] bg-[#eee4da] hover:bg-[#ebdcd0] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again / New Game</span>
          </button>
        </div>
      </div>
    </div>
  );
};
