import React, { useEffect, useState } from 'react';
import { RotateCcw, Settings, Trophy } from 'lucide-react';
import { sound } from '../utils/sound';

interface HeaderProps {
  score: number;
  bestScore: number;
  undoCount: number;
  onUndo: () => void;
  onRestartRequest: () => void;
  onOpenSettings: () => void;
  onOpenAchievements: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  score,
  bestScore,
  undoCount,
  onUndo,
  onRestartRequest,
  onOpenSettings,
  onOpenAchievements,
}) => {
  const [scoreDiff, setScoreDiff] = useState<number | null>(null);
  const [prevScore, setPrevScore] = useState<number>(score);

  useEffect(() => {
    if (score > prevScore) {
      const diff = score - prevScore;
      setScoreDiff(diff);
      const timer = setTimeout(() => {
        setScoreDiff(null);
      }, 700);
      setPrevScore(score);
      return () => clearTimeout(timer);
    } else {
      setPrevScore(score);
    }
  }, [score, prevScore]);

  return (
    <header className="w-full max-w-md mx-auto px-2 pt-2 pb-1 flex flex-col gap-3 font-2048">
      {/* Top Bar: Title on Left, Score Boxes on Right */}
      <div className="flex items-start justify-between">
        {/* Title Lockup */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#776e65] leading-none">
            MergeTiles
          </h1>
          <p className="text-xs font-semibold text-[#8f7a66] mt-1">
            Play MergeTiles Game Online
          </p>
        </div>

        {/* Score & Best Score Panels + Settings Icons */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5">
            {/* SCORE Box */}
            <div className="relative bg-[#bbada0] rounded-md px-3 sm:px-4 py-1.5 text-center min-w-[70px] sm:min-w-[80px]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#eee4da]">
                SCORE
              </div>
              <div className="text-lg sm:text-xl font-bold text-white font-num leading-tight">
                {score.toLocaleString()}
              </div>
              {/* Floating Score Popup */}
              {scoreDiff !== null && (
                <div className="absolute top-0 right-2 font-bold text-sm text-[#776e65] animate-score-float pointer-events-none drop-shadow">
                  +{scoreDiff}
                </div>
              )}
            </div>

            {/* BEST Box */}
            <div className="bg-[#bbada0] rounded-md px-3 sm:px-4 py-1.5 text-center min-w-[70px] sm:min-w-[80px]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#eee4da]">
                BEST
              </div>
              <div className="text-lg sm:text-xl font-bold text-white font-num leading-tight">
                {bestScore.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Quick Aux Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                sound.playClick();
                onOpenAchievements();
              }}
              className="p-1.5 rounded-md bg-[#eee4da] text-[#776e65] hover:bg-[#ebdcd0] transition-colors cursor-pointer"
              title="Achievements"
            >
              <Trophy className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onOpenSettings();
              }}
              className="p-1.5 rounded-md bg-[#eee4da] text-[#776e65] hover:bg-[#ebdcd0] transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Description & Action Buttons Row */}
      <div className="flex items-center justify-between gap-2 mt-0.5">
        <p className="text-xs sm:text-sm text-[#776e65] font-medium leading-tight max-w-[220px]">
          Join the numbers and get to the <span className="font-bold text-[#776e65]">2048 tile!</span>
        </p>

        <div className="flex items-center gap-2">
          {/* Undo Button */}
          <button
            onClick={() => {
              sound.playClick();
              onUndo();
            }}
            disabled={undoCount <= 0}
            className={`p-2.5 rounded-md font-bold text-xs uppercase flex items-center justify-center gap-1 transition-colors min-h-[44px] cursor-pointer ${
              undoCount > 0
                ? 'bg-[#8f7a66] text-white hover:bg-[#9f8a76] active:scale-95'
                : 'bg-[#e0d8d0] text-[#a09890] cursor-not-allowed'
            }`}
            title="Undo Last Move"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Large New Game Button */}
          <button
            onClick={() => {
              sound.playClick();
              onRestartRequest();
            }}
            className="px-4 py-2.5 rounded-md font-bold text-xs sm:text-sm text-white bg-[#8f7a66] hover:bg-[#9f8a76] transition-colors min-h-[44px] whitespace-nowrap shadow-sm active:scale-95 cursor-pointer flex items-center justify-center"
          >
            New Game
          </button>
        </div>
      </div>
    </header>
  );
};
