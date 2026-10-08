import React, { useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { sound } from '../utils/sound';

interface ConfirmModalProps {
  title?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title = 'Are you sure you want to restart the game?',
  onConfirm,
  onCancel,
}) => {
  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.playClick();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div
      onClick={() => {
        sound.playClick();
        onCancel();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#776e65]/60 backdrop-blur-sm transition-opacity duration-200 animate-fade-in font-2048 cursor-pointer select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()} // Prevent content box clicks from bubbling to backdrop
        className="w-full max-w-xs bg-[#faf8ef] border-2 border-[#bbada0] rounded-2xl p-6 text-center shadow-2xl transition-all duration-200 transform scale-100 cursor-default"
      >
        <div className="inline-flex p-3 rounded-full bg-[#eee4da] text-[#776e65] mb-3">
          <HelpCircle className="w-7 h-7" />
        </div>

        <h3 className="font-extrabold text-base sm:text-lg text-[#776e65] mb-6 leading-snug">
          {title}
        </h3>

        <div className="flex gap-3">
          {/* NO Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sound.playClick();
              onCancel();
            }}
            className="flex-1 py-3 px-4 rounded-lg bg-[#eee4da] hover:bg-[#ebdcd0] text-[#776e65] font-black text-sm uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
          >
            NO
          </button>

          {/* YES Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sound.playClick();
              onConfirm();
            }}
            className="flex-1 py-3 px-4 rounded-lg bg-[#8f7a66] hover:bg-[#9f8a76] text-white font-black text-sm uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow"
          >
            YES
          </button>
        </div>
      </div>
    </div>
  );
};
