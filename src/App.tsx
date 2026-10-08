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
import {
  initializeStorage,
  loadGame,
  saveGame,
  SavedGameState,
} from './utils/storage';
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

const SETTINGS_KEY = 'mergetiles_settings_v1';

export default function App() {
  // Loading State for Playgama Storage Initialization
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  // Helper to persist current game state via Playgama Storage SDK
  const persistState = useCallback(
    (overrides?: Partial<Omit<SavedGameState, 'updatedAt'>>) => {
      const fullState: Omit<SavedGameState, 'updatedAt'> = {
        board: overrides?.board ?? board,
        score: overrides?.score ?? score,
        bestScore: overrides?.bestScore ?? bestScore,
        gameWon: overrides?.gameWon ?? gameWon,
        gameOver: overrides?.gameOver ?? gameOver,
        hasContinued: overrides?.hasContinued ?? hasContinued,
        previousBoard: overrides?.previousBoard !== undefined ? overrides.previousBoard : previousBoard,
        previousScore: overrides?.previousScore !== undefined ? overrides.previousScore : previousScore,
        stats: overrides?.stats ?? stats,
      };
      saveGame(fullState);
    },
    [board, score, bestScore, gameWon, gameOver, hasContinued, previousBoard, previousScore, stats]
  );

  // 1. Initialize Playgama SDK Bridge and Load Cloud Save Data on startup
  useEffect(() => {
    let isMounted = true;

    async function initAndLoadStorage() {
      // Step A: Initialize Playgama Bridge SDK
      await initializeStorage();

      // Step B: Load game progress from Playgama Storage
      const savedData = await loadGame();

      // Load Settings
      try {
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings(parsed);
          sound.setSoundEnabled(parsed.sound);
          sound.setVibrationEnabled(parsed.vibration);
        }
      } catch {
        // Ignore settings fallback
      }

      if (isMounted) {
        if (savedData) {
          // Restore game state from Playgama cloud save
          setBoard(savedData.board);
          setTiles(buildTilesFromBoardWithFlags(savedData.board, null, []));
          setScore(savedData.score);
          setBestScore(savedData.bestScore);
          setGameWon(savedData.gameWon);
          setGameOver(savedData.gameOver);
          setHasContinued(savedData.hasContinued);
          setPreviousBoard(savedData.previousBoard);
          setPreviousScore(savedData.previousScore);
          if (savedData.stats) {
            setStats(savedData.stats);
          }
        } else {
          // No save data found -> initialize fresh game
          const { board: initialBoard, tiles: initialTiles } = newGameBoard();
          setBoard(initialBoard);
          setTiles(initialTiles);
          setScore(0);
          setPreviousBoard(null);
          setPreviousScore(0);
          setGameOver(false);
          setGameWon(false);
          setHasContinued(false);

          // Initial Save
          saveGame({
            board: initialBoard,
            score: 0,
            bestScore: 0,
            gameWon: false,
            gameOver: false,
            hasContinued: false,
            previousBoard: null,
            previousScore: 0,
            stats: {
              bestScore: 0,
              gamesPlayed: 1,
              totalMerges: 0,
              highestTile: 2,
              wins: 0,
            },
          });
        }

        setIsLoading(false);
      }
    }

    initAndLoadStorage();

    return () => {
      isMounted = false;
    };
  }, []);

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

    const updatedStats = {
      ...stats,
      gamesPlayed: stats.gamesPlayed + 1,
    };
    setStats(updatedStats);

    // Save New Game State to Playgama Storage
    persistState({
      board: initialBoard,
      score: 0,
      previousBoard: null,
      previousScore: 0,
      gameOver: false,
      gameWon: false,
      hasContinued: false,
      stats: updatedStats,
    });
  }, [stats, persistState]);

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
      const newPrevBoard = board.map((row) => [...row]);
      const newPrevScore = score;
      setPreviousBoard(newPrevBoard);
      setPreviousScore(newPrevScore);

      // 2. Add score from merges
      const newScore = score + moveResult.scoreGained;
      const newBestScore = Math.max(bestScore, newScore);
      setScore(newScore);
      setBestScore(newBestScore);

      // 3. Add exactly ONE new tile (90% chance of 2, 10% chance of 4)
      const { newBoard: finalBoard, addedTile } = addRandomTileToBoard(moveResult.board);

      // 4. Update Board & UI Tiles
      setBoard(finalBoard);
      setTiles(buildTilesFromBoardWithFlags(finalBoard, moveResult.mergedMap, [addedTile]));

      // 5. Update Statistics & Sound
      const highestTile = getHighestTileValue(finalBoard);

      const newStats: GameStats = {
        ...stats,
        bestScore: Math.max(stats.bestScore, newScore),
        highestTile: Math.max(stats.highestTile, highestTile),
      };
      setStats(newStats);

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

      let newGameWon: boolean = gameWon;
      let newGameOver: boolean = gameOver;

      // 6. Win Detection (2048 tile reached for first time)
      if (has2048Tile(finalBoard) && !gameWon) {
        newGameWon = true;
        setGameWon(true);
        setShowWinModal(true);
        setConfettiActive(true);
        sound.playWin();

        newStats.wins = stats.wins + 1;
        setStats(newStats);
      } else {
        // 7. Game Over Detection
        if (isGameOver(finalBoard)) {
          newGameOver = true;
          setGameOver(true);
          sound.playGameOver();
        }
      }

      // Save updated state to Playgama Cloud Storage after valid move
      persistState({
        board: finalBoard,
        score: newScore,
        bestScore: newBestScore,
        gameWon: newGameWon,
        gameOver: newGameOver,
        previousBoard: newPrevBoard,
        previousScore: newPrevScore,
        stats: newStats,
      });

      // Release animation lock after transition completes (150ms)
      setTimeout(() => {
        isMovingRef.current = false;
      }, 150);
    },
    [board, score, bestScore, gameOver, gameWon, hasContinued, stats, persistState]
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

    const restoredBoard = previousBoard;
    const restoredScore = previousScore;

    setBoard(restoredBoard);
    setTiles(buildTilesFromBoardWithFlags(restoredBoard, null, []));
    setScore(restoredScore);
    setPreviousBoard(null);
    setPreviousScore(0);
    setGameOver(false);
    setShowWinModal(false);
    setShowConfirmUndo(false);

    // Save restored undo state to Playgama Cloud Storage
    persistState({
      board: restoredBoard,
      score: restoredScore,
      previousBoard: null,
      previousScore: 0,
      gameOver: false,
    });
  };

  // Continue Playing after reaching 2048
  const handleKeepGoing = () => {
    setHasContinued(true);
    setShowWinModal(false);
    setConfettiActive(false);

    persistState({
      hasContinued: true,
    });
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

  // Render Loading Screen while Playgama SDK initializes
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#faf8ef] text-[#776e65] flex flex-col items-center justify-center p-4 font-2048 select-none">
        <div className="text-center">
          <h1 className="text-4xl font-black text-[#776e65] mb-4 tracking-tight">MergeTiles</h1>
          <div className="w-8 h-8 border-4 border-[#8f7a66] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#8f7a66] font-bold">Loading Cloud Storage...</p>
        </div>
      </div>
    );
  }

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
