import type { CellCoords } from "./store";
import type { Board, BoardWithMeta, Cell } from "./types";

export const correctSum = 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9;

function arraySum(array: number[]): number {
  return array.reduce((a, b) => a + b, 0);
}

export function checkRow(board: Board, row: number): boolean {
  const rowValues = board[row];

  if (arraySum(rowValues) !== correctSum) {
    return false;
  }

  return true;
}

export function getColumn(board: Board, column: number): number[] {
  return board.map((row) => row[column]);
}

export function checkColumn(board: Board, column: number): boolean {
  const columnValues = getColumn(board, column);

  if (arraySum(columnValues) !== correctSum) {
    return false;
  }

  return true;
}

export function getBoxByCoords(
  board: BoardWithMeta,
  coords: CellCoords
): Cell[][] {
  const [row, column] = coords;
  const boxRow: number = Math.floor(row / 3) * 3;
  const boxCol: number = Math.floor(column / 3) * 3;

  return board
    .slice(boxRow, boxRow + 3)
    .map((row) => row.slice(boxCol, boxCol + 3));
}

export function checkBox(
  board: BoardWithMeta,
  row: number,
  column: number
): boolean {
  const boxValues = getBoxByCoords(board, [row, column]).map((row) => {
    return row.map((col) => col.value);
  });

  if (arraySum(boxValues.flatMap((row) => row)) !== correctSum) {
    return false;
  }

  return true;
}

export function generateEmptyBoard(): Board {
  return new Array(9).fill(0).map(() => new Array(9).fill(0));
}

export function chunkArray<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}

export function getNotesArray(array: number[]): number[][] {
  const notes = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  array.forEach((value) => {
    switch (value) {
      case 1:
        notes[0][0] = value;
        break;
      case 2:
        notes[0][1] = value;
        break;
      case 3:
        notes[0][2] = value;
        break;
      case 4:
        notes[1][0] = value;
        break;
      case 5:
        notes[1][1] = value;
        break;
      case 6:
        notes[1][2] = value;
        break;
      case 7:
        notes[2][0] = value;
        break;
      case 8:
        notes[2][1] = value;
        break;
      case 9:
        notes[2][2] = value;
        break;
    }
  });

  return notes;
}
