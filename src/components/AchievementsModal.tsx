import React from 'react';
import { X, Trophy, CheckCircle, Lock } from 'lucide-react';
import { Achievement, GameStats } from '../types/game';
import { sound } from '../utils/sound';

interface AchievementsModalProps {
  stats: GameStats;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  stats,
  onClose,
}) => {
  const achievements: Achievement[] = [
    {
      id: 'tile_128',
      value: 128,
      title: '128 Tile',
      description: 'Merge tiles up to 128.',
      unlocked: stats.highestTile >= 128,
    },
    {
      id: 'tile_256',
      value: 256,
      title: '256 Tile',
      description: 'Merge tiles up to 256.',
      unlocked: stats.highestTile >= 256,
    },
    {
      id: 'tile_512',
      value: 512,
      title: '512 Tile',
      description: 'Merge tiles up to 512.',
      unlocked: stats.highestTile >= 512,
    },
    {
      id: 'tile_1024',
      value: 1024,
      title: '1024 Tile',
      description: 'Merge tiles up to 1024.',
      unlocked: stats.highestTile >= 1024,
    },
    {
      id: 'tile_2048',
      value: 2048,
      title: '2048 Champion',
      description: 'Unlock the legendary 2048 Tile!',
      unlocked: stats.highestTile >= 2048,
    },
    {
      id: 'tile_4096',
      value: 4096,
      title: '4096 Master',
      description: 'Reach beyond 2048 up to 4096.',
      unlocked: stats.highestTile >= 4096,
    },
    {
      id: 'merges_100',
      value: 100,
      title: '100 Merges',
      description: 'Perform 100 total tile merges.',
      unlocked: stats.totalMerges >= 100,
    },
    {
      id: 'score_10k',
      value: 10000,
      title: '10,000 High Score',
      description: 'Reach a score of 10,000 or higher.',
      unlocked: stats.bestScore >= 10000,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#776e65]/60 backdrop-blur-sm animate-fade-in font-2048">
      <div className="w-full max-w-sm bg-[#faf8ef] border-2 border-[#bbada0] rounded-2xl p-5 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#eee4da] shrink-0">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#edc22e]" />
            <h2 className="font-extrabold text-lg text-[#776e65]">
              MILESTONES
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

        {/* Progress */}
        <div className="bg-[#eee4da]/60 p-3 rounded-xl border border-[#e0d8d0] mb-3 shrink-0">
          <div className="flex justify-between items-center text-xs font-bold text-[#776e65] mb-1.5">
            <span>Progress</span>
            <span className="font-num">
              {unlockedCount} / {achievements.length}
            </span>
          </div>
          <div className="w-full h-2 bg-[#cdc1b4] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#edc22e] rounded-full transition-all duration-300"
              style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {achievements.map((item) => (
            <div
              key={item.id}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-3 ${
                item.unlocked
                  ? 'bg-[#eee4da] border-[#edc22e]/60'
                  : 'bg-[#faf8ef] border-[#e0d8d0] opacity-60'
              }`}
            >
              <div
                className={`p-2 rounded-lg flex items-center justify-center shrink-0 ${
                  item.unlocked
                    ? 'bg-[#edc22e] text-white'
                    : 'bg-[#cdc1b4] text-[#8f7a66]'
                }`}
              >
                {item.unlocked ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className={`text-xs font-bold truncate ${
                    item.unlocked ? 'text-[#776e65]' : 'text-[#8f7a66]'
                  }`}
                >
                  {item.title}
                </div>
                <div className="text-[10px] text-[#8f7a66] leading-tight">
                  {item.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
