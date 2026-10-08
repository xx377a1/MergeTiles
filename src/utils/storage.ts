import { GameStats } from '../types/game';

export interface SavedGameState {
  board: number[][];
  score: number;
  bestScore: number;
  gameWon: boolean;
  gameOver: boolean;
  hasContinued: boolean;
  previousBoard: number[][] | null;
  previousScore: number;
  stats: GameStats;
  updatedAt: number;
}

const SAVE_KEY = 'mergetiles_save_v1';

/**
 * Safely retrieves GamePix SDK instance if available
 */
function getGamePixSDK() {
  if (typeof window !== 'undefined' && (window as unknown as { GamePix?: any }).GamePix) {
    return (window as unknown as { GamePix?: any }).GamePix;
  }
  return null;
}

/**
 * Loads and validates saved game state using GamePix.localStorage.getItem
 */
export function loadGame(): SavedGameState | null {
  const gpix = getGamePixSDK();

  // Primary: Load from GamePix.localStorage
  if (gpix && gpix.localStorage && typeof gpix.localStorage.getItem === 'function') {
    try {
      const rawData = gpix.localStorage.getItem(SAVE_KEY);
      if (rawData) {
        const parsed = JSON.parse(rawData);
        if (isValidSaveState(parsed)) {
          return parsed as SavedGameState;
        }
      }
    } catch (err) {
      console.warn('GamePix.localStorage getItem error:', err);
    }
  }

  // Secondary Fallback: Load from browser localStorage
  try {
    const localData = localStorage.getItem(SAVE_KEY);
    if (localData) {
      const parsed = JSON.parse(localData);
      if (isValidSaveState(parsed)) {
        return parsed as SavedGameState;
      }
    }
  } catch {
    // Ignore fallback parse errors
  }

  return null;
}

/**
 * Saves current game state using GamePix.localStorage.setItem and updates GamePix.updateScore
 */
export function saveGame(state: Omit<SavedGameState, 'updatedAt'>): boolean {
  const gpix = getGamePixSDK();

  const fullSaveData: SavedGameState = {
    ...state,
    updatedAt: Date.now(),
  };

  const serialized = JSON.stringify(fullSaveData);

  // 1. Update score on GamePix platform if method exists
  if (gpix && typeof gpix.updateScore === 'function') {
    try {
      const validScore = Math.max(0, Math.floor(state.score || 0));
      gpix.updateScore(validScore);
    } catch (err) {
      console.warn('GamePix.updateScore error:', err);
    }
  }

  let savedSuccess = false;

  // 2. Primary Save: GamePix.localStorage.setItem
  if (gpix && gpix.localStorage && typeof gpix.localStorage.setItem === 'function') {
    try {
      gpix.localStorage.setItem(SAVE_KEY, serialized);
      savedSuccess = true;
    } catch (err) {
      console.warn('GamePix.localStorage setItem error:', err);
    }
  }

  // 3. Backup Save: Browser localStorage
  try {
    localStorage.setItem(SAVE_KEY, serialized);
    savedSuccess = true;
  } catch {
    // Ignore
  }

  return savedSuccess;
}

/**
 * Clears saved game data from GamePix.localStorage
 */
export function clearSavedGame(): void {
  const gpix = getGamePixSDK();

  if (gpix && gpix.localStorage && typeof gpix.localStorage.removeItem === 'function') {
    try {
      gpix.localStorage.removeItem(SAVE_KEY);
    } catch (err) {
      console.warn('GamePix.localStorage removeItem error:', err);
    }
  }

  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Validates save data integrity before restoring:
 * - Board must be 4x4 matrix
 * - Cell values must be non-negative integers
 * - Score and bestScore must be non-negative numbers
 * - Booleans must be valid
 */
function isValidSaveState(data: any): boolean {
  if (!data || typeof data !== 'object') return false;

  // Board 4x4 validation
  if (!Array.isArray(data.board) || data.board.length !== 4) return false;
  for (let r = 0; r < 4; r++) {
    if (!Array.isArray(data.board[r]) || data.board[r].length !== 4) return false;
    for (let c = 0; c < 4; c++) {
      const val = data.board[r][c];
      if (typeof val !== 'number' || isNaN(val) || val < 0) return false;
    }
  }

  // Previous board validation (if present)
  if (data.previousBoard !== null && data.previousBoard !== undefined) {
    if (!Array.isArray(data.previousBoard) || data.previousBoard.length !== 4) return false;
    for (let r = 0; r < 4; r++) {
      if (!Array.isArray(data.previousBoard[r]) || data.previousBoard[r].length !== 4) return false;
      for (let c = 0; c < 4; c++) {
        const val = data.previousBoard[r][c];
        if (typeof val !== 'number' || isNaN(val) || val < 0) return false;
      }
    }
  }

  // Scores validation
  if (typeof data.score !== 'number' || isNaN(data.score) || data.score < 0) return false;
  if (typeof data.bestScore !== 'number' || isNaN(data.bestScore) || data.bestScore < 0) return false;

  // Booleans validation
  if (typeof data.gameWon !== 'boolean') return false;
  if (typeof data.gameOver !== 'boolean') return false;

  return true;
}
