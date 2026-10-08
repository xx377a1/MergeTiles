import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { MoveDirection } from '../types/game';
import { sound } from '../utils/sound';

interface TouchPadControlsProps {
  onMove: (direction: MoveDirection) => void;
}

export const TouchPadControls: React.FC<TouchPadControlsProps> = ({ onMove }) => {
  const handlePress = (dir: MoveDirection) => {
    sound.playClick();
    onMove(dir);
  };

  return (
    <div className="w-full max-w-xs mx-auto my-1 px-4 flex flex-col items-center font-2048">
      <div className="relative w-36 h-36">
        {/* UP Button */}
        <button
          onClick={() => handlePress('UP')}
          aria-label="Swipe Up"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-11 h-11 rounded-lg bg-[#8f7a66] text-white hover:bg-[#9f8a76] flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow"
        >
          <ChevronUp className="w-6 h-6" />
        </button>

        {/* LEFT Button */}
        <button
          onClick={() => handlePress('LEFT')}
          aria-label="Swipe Left"
          className="absolute top-1/2 left-0 -translate-y-1/2 w-11 h-11 rounded-lg bg-[#8f7a66] text-white hover:bg-[#9f8a76] flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Center Indicator */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#bbada0] flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#eee4da]" />
        </div>

        {/* RIGHT Button */}
        <button
          onClick={() => handlePress('RIGHT')}
          aria-label="Swipe Right"
          className="absolute top-1/2 right-0 -translate-y-1/2 w-11 h-11 rounded-lg bg-[#8f7a66] text-white hover:bg-[#9f8a76] flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* DOWN Button */}
        <button
          onClick={() => handlePress('DOWN')}
          aria-label="Swipe Down"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-11 h-11 rounded-lg bg-[#8f7a66] text-white hover:bg-[#9f8a76] flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>
      <p className="text-[10px] text-[#8f7a66] font-semibold mt-0.5">
        Tap directional arrows or swipe grid
      </p>
    </div>
  );
};
