import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Tile, MoveDirection, GameSettings, GameStats } from './types/game';
import {
  newGameBoard,
  moveByDirection,
  addRandomTileToBoard,
  buildTilesFromBoardWithFlags,
  isGameOver,
  has2048Tile,
  getHighestTileValue,
} from './utils/gameLogic';
import { sound } from './utils/sound';

import { Header } from './components/Header';
import { GameBoard } from './components/GameBoard';
import { TouchPadControls } from './components/TouchPadControls';
import { WinModal } from './components/WinModal';
import { GameOverModal } from './components/GameOverModal';
import { SettingsModal } from './components/SettingsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ConfettiCanvas } from './components/ConfettiCanvas';

const BEST_SCORE_KEY = 'mergetiles_best_score_v1';
const STATS_KEY = 'mergetiles_stats_v1';
const SETTINGS_KEY = 'mergetiles_settings_v1';

export default function App() {
  // Game State Engine Variables
  const [board, setBoard] = useState<number[][]>(() => [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(0);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [hasContinued, setHasContinued] = useState<boolean>(false);

  // Undo System State Variables
  const [previousBoard, setPreviousBoard] = useState<number[][] | null>(null);
  const [previousScore, setPreviousScore] = useState<number>(0);

  // UI Tiles State
  const [tiles, setTiles] = useState<Tile[]>([]);

  // Animation Lock to prevent rapid repeat inputs during move transitions
  const isMovingRef = useRef<boolean>(false);

  // Modals & UI Overlays
  const [showWinModal, setShowWinModal] = useState<boolean>(false);
  const [showConfirmRestart, setShowConfirmRestart] = useState<boolean>(false);
  const [showConfirmUndo, setShowConfirmUndo] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const [milestoneToast, setMilestoneToast] = useState<string | null>(null);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);

  // Stats
  const [stats, setStats] = useState<GameStats>({
    bestScore: 0,
    gamesPlayed: 1,
    totalMerges: 0,
    highestTile: 2,
    wins: 0,
  });

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    sound: true,
    vibration: true,
    showTouchPad: false,
  });

  // Load saved data from localStorage on mount
  useEffect(() => {
    try {
      const savedBest = localStorage.getItem(BEST_SCORE_KEY);
      if (savedBest) {
        const val = parseInt(savedBest, 10);
        if (!isNaN(val)) setBestScore(val);
      }

      const savedStats = localStorage.getItem(STATS_KEY);
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }

      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        sound.setSoundEnabled(parsed.sound);
        sound.setVibrationEnabled(parsed.vibration);
      }
    } catch {
      // LocalStorage fallback
    }

    startNewGame();
  }, []);

  // Save best score and stats whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(BEST_SCORE_KEY, bestScore.toString());
    } catch {
      // Ignore
    }
  }, [bestScore]);

  useEffect(() => {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch {
      // Ignore
    }
  }, [stats]);

  // Restart / New Game
  const startNewGame = useCallback(() => {
    const { board: initialBoard, tiles: initialTiles } = newGameBoard();
    setBoard(initialBoard);
    setTiles(initialTiles);
    setScore(0);
    setPreviousBoard(null);
    setPreviousScore(0);
    setGameOver(false);
    setGameWon(false);
    setHasContinued(false);
    setShowWinModal(false);
    setShowConfirmRestart(false);
    setConfettiActive(false);

    setStats((prev) => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
    }));
  }, []);

  const triggerMilestone = (tileVal: number) => {
    setMilestoneToast(`MILESTONE UNLOCKED: ${tileVal} TILE!`);
    sound.playMilestone();
    setTimeout(() => {
      setMilestoneToast(null);
    }, 2800);
  };

  // Move Handler
  const handleMove = useCallback(
    (direction: MoveDirection) => {
      if (gameOver) return;
      if (gameWon && !hasContinued) return;
      if (isMovingRef.current) return;

      isMovingRef.current = true;

      const moveResult = moveByDirection(board, direction);

      if (!moveResult.changed) {
        sound.playBump();
        isMovingRef.current = false;
        return;
      }

      // 1. Save Undo State before applying changes
      setPreviousBoard(board.map((row) => [...row]));
      setPreviousScore(score);

      // 2. Add score from merges
      const newScore = score + moveResult.scoreGained;
      setScore(newScore);
      if (newScore > bestScore) {
        setBestScore(newScore);
      }

      // 3. Add exactly ONE new tile (90% chance of 2, 10% chance of 4)
      const { newBoard: finalBoard, addedTile } = addRandomTileToBoard(moveResult.board);

      // 4. Update Board & UI Tiles
      setBoard(finalBoard);
      setTiles(buildTilesFromBoardWithFlags(finalBoard, moveResult.mergedMap, [addedTile]));

      // 5. Update Statistics & Sound
      const highestTile = getHighestTileValue(finalBoard);

      setStats((prev) => ({
        ...prev,
        bestScore: Math.max(prev.bestScore, newScore),
        highestTile: Math.max(prev.highestTile, highestTile),
      }));

      if (moveResult.scoreGained > 0) {
        sound.playMerge(highestTile);
      } else {
        sound.playMove();
      }

      // Check Milestones
      if (highestTile > stats.highestTile) {
        if ([128, 256, 512, 1024, 4096].includes(highestTile)) {
          triggerMilestone(highestTile);
        }
      }

      // 6. Win Detection (2048 tile reached for first time)
      if (has2048Tile(finalBoard) && !gameWon) {
        setGameWon(true);
        setShowWinModal(true);
        setConfettiActive(true);
        sound.playWin();

        setStats((prev) => ({
          ...prev,
          wins: prev.wins + 1,
        }));
      } else {
        // 7. Game Over Detection
        if (isGameOver(finalBoard)) {
          setGameOver(true);
          sound.playGameOver();
        }
      }

      // Release animation lock after transition completes (150ms)
      setTimeout(() => {
        isMovingRef.current = false;
      }, 150);
    },
    [board, score, bestScore, gameOver, gameWon, hasContinued, stats.highestTile]
  );

  // Request Undo (Opens confirmation popup or shows message if no move to undo)
  const handleUndoRequest = () => {
    if (!previousBoard) {
      sound.playBump();
      setMilestoneToast('No previous move available to undo');
      setTimeout(() => {
        setMilestoneToast(null);
      }, 2000);
      return;
    }
    setShowConfirmUndo(true);
  };

  // Undo Action (Executed ONLY after clicking YES on confirmation popup)
  const handleUndo = () => {
    if (!previousBoard) return;

    setBoard(previousBoard);
    setTiles(buildTilesFromBoardWithFlags(previousBoard, null, []));
    setScore(previousScore);
    setPreviousBoard(null);
    setPreviousScore(0);
    setGameOver(false);
    setShowWinModal(false);
    setShowConfirmUndo(false);
  };

  // Continue Playing after reaching 2048
  const handleKeepGoing = () => {
    setHasContinued(true);
    setShowWinModal(false);
    setConfettiActive(false);
  };

  const handleUpdateSettings = (newSet: Partial<GameSettings>) => {
    const updated = { ...settings, ...newSet };
    setSettings(updated);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleResetStats = () => {
    setBestScore(0);
    const reset = {
      bestScore: 0,
      gamesPlayed: 1,
      totalMerges: 0,
      highestTile: 2,
      wins: 0,
    };
    setStats(reset);
    try {
      localStorage.removeItem(BEST_SCORE_KEY);
      localStorage.setItem(STATS_KEY, JSON.stringify(reset));
    } catch {
      // Ignore
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#faf8ef] text-[#776e65] flex flex-col justify-between items-center py-4 px-2 sm:px-4 font-2048 relative overflow-hidden select-none">
      {/* Confetti Animation Canvas */}
      <ConfettiCanvas active={confettiActive} />

      {/* Milestone Toast Notification */}
      {milestoneToast && (
        <div className="fixed top-5 z-50 bg-[#edc22e] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg animate-bounce text-center tracking-wider">
          {milestoneToast}
        </div>
      )}

      {/* Main Game Interface */}
      <div className="w-full max-w-md my-auto flex flex-col items-center justify-center relative z-10">
        <Header
          score={score}
          bestScore={bestScore}
          undoCount={previousBoard ? 1 : 0}
          onUndo={handleUndoRequest}
          onRestartRequest={() => setShowConfirmRestart(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenAchievements={() => setShowAchievements(true)}
        />

        <GameBoard tiles={tiles} onMove={handleMove} />

        {settings.showTouchPad && <TouchPadControls onMove={handleMove} />}
      </div>

      {/* Footer Info */}
      <footer className="w-full max-w-md text-center py-2 relative z-10">
        <p className="text-xs text-[#8f7a66] font-medium">
          Swipe or press <span className="font-bold text-[#776e65]">Arrow Keys / WASD</span> to merge tiles
        </p>
      </footer>

      {/* MODALS */}
      {showWinModal && (
        <WinModal
          score={score}
          bestScore={bestScore}
          onKeepGoing={handleKeepGoing}
          onRestart={() => {
            setShowWinModal(false);
            setShowConfirmRestart(true);
          }}
        />
      )}

      {gameOver && (
        <GameOverModal
          score={score}
          bestScore={bestScore}
          highestTile={stats.highestTile}
          undoCount={previousBoard ? 1 : 0}
          onUndo={handleUndoRequest}
          onRestart={() => {
            setShowConfirmRestart(true);
          }}
        />
      )}

      {showConfirmRestart && (
        <ConfirmModal
          title="Are you sure you want to restart the game?"
          onConfirm={startNewGame}
          onCancel={() => setShowConfirmRestart(false)}
        />
      )}

      {showConfirmUndo && (
        <ConfirmModal
          title="Are you sure you want to undo your last move?"
          onConfirm={handleUndo}
          onCancel={() => setShowConfirmUndo(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showAchievements && (
        <AchievementsModal
          stats={stats}
          onClose={() => setShowAchievements(false)}
        />
      )}
    </div>
  );
}
