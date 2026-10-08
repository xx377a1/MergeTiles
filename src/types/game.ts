export type MoveDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Tile {
  id: string;
  value: number;
  row: number; // 0..3
  col: number; // 0..3
  isNew?: boolean;
  isMerged?: boolean;
}

export interface GameEngineState {
  board: number[][]; // 4x4 matrix, 0 for empty
  score: number;
  bestScore: number;
  gameWon: boolean;
  gameOver: boolean;
  previousBoard: number[][] | null;
  previousScore: number;
  canUndo: boolean;
  hasContinued: boolean;
}

export interface HistoryState {
  tiles: Tile[];
  board: number[][];
  score: number;
  gameOver: boolean;
  won: boolean;
  hasContinued: boolean;
}

export interface GameSettings {
  sound: boolean;
  vibration: boolean;
  showTouchPad: boolean;
}

export interface GameStats {
  bestScore: number;
  gamesPlayed: number;
  totalMerges: number;
  highestTile: number;
  wins: number;
}

export interface Achievement {
  id: string;
  value: number;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
}

