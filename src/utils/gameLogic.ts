import { Tile, MoveDirection } from '../types/game';

// Generates a unique tile ID
export function generateTileId(): string {
  return 'tile_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
}

// Convert 2D matrix board into Tile array for visual UI
export function matrixToTiles(board: number[][]): Tile[] {
  const tiles: Tile[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] !== 0) {
        tiles.push({
          id: `tile_${r}_${c}_${board[r][c]}`,
          value: board[r][c],
          row: r,
          col: c,
        });
      }
    }
  }
  return tiles;
}

// Create an empty 4x4 matrix initialized to 0
export function createEmptyBoard(): number[][] {
  return [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
}

// Get all empty cell coordinates where value is 0
export function getEmptyCells(board: number[][]): { row: number; col: number }[] {
  const emptyCells: { row: number; col: number }[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) {
        emptyCells.push({ row: r, col: c });
      }
    }
  }
  return emptyCells;
}

// Add exactly one random tile (90% chance of 2, 10% chance of 4) into an empty cell
export function addRandomTileToBoard(board: number[][]): {
  newBoard: number[][];
  addedTile: { row: number; col: number; value: number } | null;
} {
  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) {
    return { newBoard: board, addedTile: null };
  }

  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  const cell = emptyCells[randomIndex];
  const value = Math.random() < 0.9 ? 2 : 4;

  const newBoard = board.map((row) => [...row]);
  newBoard[cell.row][cell.col] = value;

  return {
    newBoard,
    addedTile: { row: cell.row, col: cell.col, value },
  };
}

// Initialize a new game board with exactly 2 starting tiles
export function newGameBoard(): { board: number[][]; tiles: Tile[] } {
  let board = createEmptyBoard();
  const step1 = addRandomTileToBoard(board);
  board = step1.newBoard;
  const step2 = addRandomTileToBoard(board);
  board = step2.newBoard;

  const tiles = buildTilesFromBoardWithFlags(board, null, [step1.addedTile, step2.addedTile]);
  return { board, tiles };
}

// Slide & Merge a single 1D array of length 4 to the left
export function slideAndMergeLine(line: number[]): {
  newLine: number[];
  scoreGained: number;
  mergedPositions: number[];
} {
  const nonZeros = line.filter((v) => v !== 0);
  const newLine: number[] = [];
  let scoreGained = 0;
  const mergedPositions: number[] = [];

  let i = 0;
  while (i < nonZeros.length) {
    if (i + 1 < nonZeros.length && nonZeros[i] === nonZeros[i + 1]) {
      const mergedVal = nonZeros[i] * 2;
      scoreGained += mergedVal;
      mergedPositions.push(newLine.length);
      newLine.push(mergedVal);
      i += 2; // Pair merged, skip next
    } else {
      newLine.push(nonZeros[i]);
      i += 1;
    }
  }

  while (newLine.length < 4) {
    newLine.push(0);
  }

  return { newLine, scoreGained, mergedPositions };
}

export interface MoveResult {
  board: number[][];
  scoreGained: number;
  changed: boolean;
  mergedMap: boolean[][]; // [row][col] indicates if merged in this move
}

// Move Left
export function moveLeft(board: number[][]): MoveResult {
  let scoreGained = 0;
  let changed = false;
  const newBoard: number[][] = [];
  const mergedMap: boolean[][] = createEmptyBoard().map((r) => r.map(() => false));

  for (let r = 0; r < 4; r++) {
    const row = board[r];
    const { newLine, scoreGained: rowScore, mergedPositions } = slideAndMergeLine(row);
    scoreGained += rowScore;
    newBoard.push(newLine);

    mergedPositions.forEach((colIdx) => {
      mergedMap[r][colIdx] = true;
    });

    for (let c = 0; c < 4; c++) {
      if (row[c] !== newLine[c]) {
        changed = true;
      }
    }
  }

  return { board: newBoard, scoreGained, changed, mergedMap };
}

// Move Right
export function moveRight(board: number[][]): MoveResult {
  let scoreGained = 0;
  let changed = false;
  const newBoard: number[][] = [];
  const mergedMap: boolean[][] = createEmptyBoard().map((r) => r.map(() => false));

  for (let r = 0; r < 4; r++) {
    const reversedRow = [...board[r]].reverse();
    const { newLine, scoreGained: rowScore, mergedPositions } = slideAndMergeLine(reversedRow);
    scoreGained += rowScore;
    const finalRow = [...newLine].reverse();
    newBoard.push(finalRow);

    mergedPositions.forEach((colIdx) => {
      // Un-reverse col index: 0 -> 3, 1 -> 2, etc.
      mergedMap[r][3 - colIdx] = true;
    });

    for (let c = 0; c < 4; c++) {
      if (board[r][c] !== finalRow[c]) {
        changed = true;
      }
    }
  }

  return { board: newBoard, scoreGained, changed, mergedMap };
}

// Move Up
export function moveUp(board: number[][]): MoveResult {
  let scoreGained = 0;
  let changed = false;
  const newBoard = createEmptyBoard();
  const mergedMap: boolean[][] = createEmptyBoard().map((r) => r.map(() => false));

  for (let c = 0; c < 4; c++) {
    const col = [board[0][c], board[1][c], board[2][c], board[3][c]];
    const { newLine, scoreGained: colScore, mergedPositions } = slideAndMergeLine(col);
    scoreGained += colScore;

    mergedPositions.forEach((rowIdx) => {
      mergedMap[rowIdx][c] = true;
    });

    for (let r = 0; r < 4; r++) {
      newBoard[r][c] = newLine[r];
      if (board[r][c] !== newLine[r]) {
        changed = true;
      }
    }
  }

  return { board: newBoard, scoreGained, changed, mergedMap };
}

// Move Down
export function moveDown(board: number[][]): MoveResult {
  let scoreGained = 0;
  let changed = false;
  const newBoard = createEmptyBoard();
  const mergedMap: boolean[][] = createEmptyBoard().map((r) => r.map(() => false));

  for (let c = 0; c < 4; c++) {
    const col = [board[3][c], board[2][c], board[1][c], board[0][c]];
    const { newLine, scoreGained: colScore, mergedPositions } = slideAndMergeLine(col);
    scoreGained += colScore;
    const finalCol = [...newLine].reverse();

    mergedPositions.forEach((rowIdx) => {
      mergedMap[3 - rowIdx][c] = true;
    });

    for (let r = 0; r < 4; r++) {
      newBoard[r][c] = finalCol[r];
      if (board[r][c] !== finalCol[r]) {
        changed = true;
      }
    }
  }

  return { board: newBoard, scoreGained, changed, mergedMap };
}

// Execute move by Direction
export function moveByDirection(board: number[][], direction: MoveDirection): MoveResult {
  switch (direction) {
    case 'LEFT':
      return moveLeft(board);
    case 'RIGHT':
      return moveRight(board);
    case 'UP':
      return moveUp(board);
    case 'DOWN':
      return moveDown(board);
  }
}

// Helper to build animated Tile[] from board matrix with flags for merges & new tiles
export function buildTilesFromBoardWithFlags(
  board: number[][],
  mergedMap: boolean[][] | null,
  newTilesList: ({ row: number; col: number; value: number } | null)[]
): Tile[] {
  const resultTiles: Tile[] = [];

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const val = board[r][c];
      if (val !== 0) {
        const isMerged = mergedMap ? mergedMap[r][c] : false;
        const isNew = newTilesList.some(
          (nt) => nt && nt.row === r && nt.col === c && nt.value === val
        );

        resultTiles.push({
          id: `tile_${r}_${c}_${val}_${isNew ? 'new' : ''}_${isMerged ? 'merged' : ''}`,
          value: val,
          row: r,
          col: c,
          isNew,
          isMerged,
        });
      }
    }
  }

  return resultTiles;
}

// Check Game Over condition: board is full AND no horizontal or vertical merges are possible
export function isGameOver(board: number[][]): boolean {
  // Check if any empty cell exists
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) return false;
    }
  }

  // Check if any horizontal neighbor can merge
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === board[r][c + 1]) return false;
    }
  }

  // Check if any vertical neighbor can merge
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === board[r + 1][c]) return false;
    }
  }

  return true;
}

// Check if a 2048 tile or higher exists on the board
export function has2048Tile(board: number[][]): boolean {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] >= 2048) return true;
    }
  }
  return false;
}

// Get the maximum tile value present on the board
export function getHighestTileValue(board: number[][]): number {
  let max = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] > max) max = board[r][c];
    }
  }
  return max;
}
