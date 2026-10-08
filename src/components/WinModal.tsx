import React from 'react';
import { Sparkles, Play, RefreshCw } from 'lucide-react';
import { sound } from '../utils/sound';

interface WinModalProps {
  score: number;
  bestScore: number;
  onKeepGoing: () => void;
  onRestart: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({
  score,
  bestScore,
  onKeepGoing,
  onRestart,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#776e65]/60 backdrop-blur-sm animate-fade-in font-2048">
      <div className="w-full max-w-sm bg-[#faf8ef] border-4 border-[#edc22e] rounded-2xl p-6 text-center shadow-2xl relative overflow-hidden">
        <div className="inline-flex p-3 rounded-full bg-[#edc22e]/20 text-[#b58f00] mb-2 shadow-inner">
          <Sparkles className="w-8 h-8 animate-bounce" />
        </div>

        <h2 className="font-black text-3xl text-[#776e65] mb-1">
          YOU WIN!
        </h2>
        <p className="text-xs text-[#8f7a66] font-medium mb-5">
          You have successfully created the 2048 tile!
        </p>

        <div className="bg-[#bbada0] rounded-xl p-3.5 mb-6 grid grid-cols-2 gap-2 text-white">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#eee4da]">
              Score
            </div>
            <div className="font-bold text-xl font-num">
              {score.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#eee4da]">
              Best
            </div>
            <div className="font-bold text-xl font-num">
              {bestScore.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              sound.playClick();
              onKeepGoing();
            }}
            className="w-full py-3 px-4 rounded-lg font-bold text-sm text-white bg-[#edc22e] hover:bg-[#e0b522] shadow transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Keep Playing</span>
          </button>

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
