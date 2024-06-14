import { Board, BoardWithMeta, Difficulty } from "./types";

export function isSafe(
  board: Board,
  row: number,
  col: number,
  num: number
): boolean {
  // Check the row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) {
      return false;
    }
  }

  // Check the column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) {
      return false;
    }
  }

  // Check the 3x3 grid
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) {
        return false;
      }
    }
  }

  return true;
}

export function solveSudoku(board: Board): boolean {
  const emptySlot = findEmptyLocation(board);
  if (!emptySlot) {
    return true; // No empty slots left, puzzle solved
  }

  const [row, col] = emptySlot;
  for (let num = 1; num <= 9; num++) {
    if (isSafe(board, row, col, num)) {
      board[row][col] = num;

      if (solveSudoku(board)) {
        return true;
      }

      board[row][col] = 0; // Reset (backtrack)
    }
  }

  return false;
}

export function findEmptyLocation(board: Board): [number, number] | null {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === 0) {
        return [i, j];
      }
    }
  }
  return null;
}

export function generateSudoku(): Board {
  const board: Board = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillDiagonalBoxes(board);
  solveSudoku(board);
  return board;
}

export function fillDiagonalBoxes(board: Board): void {
  for (let i = 0; i < 9; i += 3) {
    fillBox(board, i, i);
  }
}

export function fillBox(board: Board, row: number, col: number): void {
  const num = Array.from({ length: 9 }, (_, i) => i + 1);
  shuffle(num);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      board[row + i][col + j] = num.pop()!;
    }
  }
}

export function shuffle(array: number[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function removeNumbers(board: Board, difficulty: Difficulty): Board {
  let _board = board.map((row) => [...row]);
  let numCellsToRemove;
  switch (difficulty) {
    case "easy":
      numCellsToRemove = 40;
      break;
    case "medium":
      numCellsToRemove = 48;
      break;
    case "hard":
      numCellsToRemove = 59;
      break;
    default:
      numCellsToRemove = 40;
  }

  for (let i = 0; i < numCellsToRemove; i++) {
    let row, col;
    do {
      row = Math.floor(Math.random() * 9);
      col = Math.floor(Math.random() * 9);
    } while (_board[row][col] === 0);
    _board[row][col] = 0;
  }

  return _board;
}

export function getBoards(difficulty: Difficulty): {
  board: BoardWithMeta;
  unfilledBoard: Board;
  solvedBoard: Board;
} {
  const solvedBoard = generateSudoku();
  const board = removeNumbers(copyBoard(solvedBoard), difficulty);
  const unfilledBoard = copyBoard(board);

  return {
    board: toMetaBoard(board),
    unfilledBoard,
    solvedBoard,
  };
}

export function fromMetaBoard(board: BoardWithMeta): Board {
  return board.map((row) => row.map((cell) => cell.value));
}

export function toMetaBoard(board: Board): BoardWithMeta {
  const metaBoard: BoardWithMeta = [];

  for (let i = 0; i < 9; i++) {
    const row = [];
    for (let j = 0; j < 9; j++) {
      row.push({
        value: board[i][j],
        highlighted: false,
        notes: [],
        selected: false,
        valid: board[i][j] !== 0 ? true : false,
        editable: board[i][j] === 0 ? true : false,
      });
    }
    metaBoard.push(row);
  }

  return metaBoard;
}

export function copyBoard(board: Board): Board {
  return board.map((row) => [...row]);
}
