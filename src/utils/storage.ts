import bridge from '@playgama/bridge';
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

const SAVE_KEY = 'mergetiles_playgama_save_v1';

let isBridgeInitialized = false;
let lastSavedTimestamp = 0;

/**
 * Initializes the official Playgama Bridge SDK
 */
export async function initializeStorage(): Promise<boolean> {
  try {
    if (!bridge.isInitialized) {
      await bridge.initialize();
    }
    isBridgeInitialized = true;
    console.log('Playgama Bridge SDK initialized successfully.');
    return true;
  } catch (error) {
    console.warn('Playgama Bridge SDK initialization unavailable, using local fallback:', error);
    isBridgeInitialized = false;
    return false;
  }
}

/**
 * Loads the saved game state using Playgama Storage API
 */
export async function loadGame(): Promise<SavedGameState | null> {
  try {
    if (isBridgeInitialized) {
      const data = await bridge.storage.get(SAVE_KEY, true);
      if (data && typeof data === 'object') {
        const parsed = data as Partial<SavedGameState>;
        if (isValidSaveState(parsed)) {
          return parsed as SavedGameState;
        }
      } else if (typeof data === 'string') {
        const parsed = JSON.parse(data);
        if (isValidSaveState(parsed)) {
          return parsed as SavedGameState;
        }
      }
    }
  } catch (err) {
    console.warn('Playgama Storage load error:', err);
  }

  // Fallback to localStorage if Playgama is uninitialized or fails
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
 * Saves the current game state via Playgama Storage API with race condition protection
 */
export async function saveGame(state: Omit<SavedGameState, 'updatedAt'>): Promise<boolean> {
  const timestamp = Date.now();
  if (timestamp < lastSavedTimestamp) {
    // Prevent stale async state from overwriting newer state
    return false;
  }
  lastSavedTimestamp = timestamp;

  const fullSaveData: SavedGameState = {
    ...state,
    updatedAt: timestamp,
  };

  // Local fallback save
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(fullSaveData));
  } catch {
    // Ignore
  }

  if (isBridgeInitialized) {
    try {
      await bridge.storage.set(SAVE_KEY, fullSaveData);
      return true;
    } catch (err) {
      console.warn('Playgama Storage save error:', err);
    }
  }

  return false;
}

/**
 * Clears saved game data from Playgama Storage
 */
export async function clearSavedGame(): Promise<void> {
  lastSavedTimestamp = Date.now();
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Ignore
  }

  if (isBridgeInitialized) {
    try {
      await bridge.storage.delete(SAVE_KEY);
    } catch (err) {
      console.warn('Playgama Storage delete error:', err);
    }
  }
}

/**
 * Validates the structure of loaded save state
 */
function isValidSaveState(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.board) || data.board.length !== 4) return false;
  for (let r = 0; r < 4; r++) {
    if (!Array.isArray(data.board[r]) || data.board[r].length !== 4) return false;
  }
  if (typeof data.score !== 'number' || typeof data.bestScore !== 'number') return false;
  return true;
}
