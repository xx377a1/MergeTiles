import React from 'react';
import { X, Volume2, VolumeX, Smartphone, Gamepad2, HelpCircle } from 'lucide-react';
import { GameSettings } from '../types/game';
import { sound } from '../utils/sound';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#776e65]/60 backdrop-blur-sm animate-fade-in font-2048">
      <div className="w-full max-w-sm bg-[#faf8ef] border-2 border-[#bbada0] rounded-2xl p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#eee4da]">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-[#8f7a66]" />
            <h2 className="font-extrabold text-lg text-[#776e65]">
              SETTINGS
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-md bg-[#eee4da] text-[#776e65] hover:bg-[#ebdcd0] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3 mb-5">
          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#eee4da]/60 border border-[#e0d8d0]">
            <div className="flex items-center gap-2.5">
              {settings.sound ? (
                <Volume2 className="w-5 h-5 text-[#8f7a66]" />
              ) : (
                <VolumeX className="w-5 h-5 text-[#a09890]" />
              )}
              <div>
                <div className="text-xs font-bold text-[#776e65]">
                  Sound Effects
                </div>
                <div className="text-[10px] text-[#8f7a66]">
                  Move and merge chimes
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const next = !settings.sound;
                sound.setSoundEnabled(next);
                if (next) sound.playClick();
                onUpdateSettings({ sound: next });
              }}
              className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center cursor-pointer ${
                settings.sound ? 'bg-[#8f7a66] justify-end' : 'bg-[#cdc1b4] justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Vibration Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#eee4da]/60 border border-[#e0d8d0]">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-[#8f7a66]" />
              <div>
                <div className="text-xs font-bold text-[#776e65]">
                  Haptic Feedback
                </div>
                <div className="text-[10px] text-[#8f7a66]">
                  Vibrate on tile merge
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const next = !settings.vibration;
                sound.setVibrationEnabled(next);
                if (next) sound.playClick();
                onUpdateSettings({ vibration: next });
              }}
              className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center cursor-pointer ${
                settings.vibration ? 'bg-[#8f7a66] justify-end' : 'bg-[#cdc1b4] justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Touch D-Pad Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#eee4da]/60 border border-[#e0d8d0]">
            <div className="flex items-center gap-2.5">
              <Gamepad2 className="w-5 h-5 text-[#8f7a66]" />
              <div>
                <div className="text-xs font-bold text-[#776e65]">
                  Directional Touch D-Pad
                </div>
                <div className="text-[10px] text-[#8f7a66]">
                  Show tap arrows below board
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onUpdateSettings({ showTouchPad: !settings.showTouchPad });
              }}
              className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center cursor-pointer ${
                settings.showTouchPad ? 'bg-[#8f7a66] justify-end' : 'bg-[#cdc1b4] justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>

        {/* How to Play Guide */}
        <div className="p-3.5 rounded-xl bg-[#eee4da]/60 border border-[#e0d8d0] text-xs text-[#776e65]">
          <div className="flex items-center gap-1.5 font-bold text-[#8f7a66] mb-2">
            <HelpCircle className="w-4 h-4" />
            <span>HOW TO PLAY</span>
          </div>
          <ul className="space-y-1 text-[11px] text-[#8f7a66] list-disc list-inside">
            <li>Swipe or press Arrow Keys to move tiles.</li>
            <li>Tiles with the same number merge into one!</li>
            <li>2 + 2 = 4, 4 + 4 = 8, 8 + 8 = 16 ... 2048!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
