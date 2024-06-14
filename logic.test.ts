import { generateSudoku, isSafe, toMetaBoard } from "./logic";
import { checkRow, checkBox, checkColumn } from "./utils";

describe("isSafe", () => {
  it("returns true if the number is safe", () => {
    // completed board
    const board = [
      [0, 2, 3, 6, 7, 8, 9, 4, 5],
      [5, 8, 4, 2, 3, 9, 7, 6, 1],
      [9, 6, 7, 1, 4, 5, 3, 2, 8],
      [3, 7, 2, 4, 6, 1, 5, 8, 9],
      [6, 9, 1, 5, 8, 3, 2, 7, 4],
      [4, 5, 8, 7, 9, 2, 6, 1, 3],
      [8, 3, 6, 9, 2, 4, 1, 5, 7],
      [2, 1, 9, 8, 5, 7, 4, 3, 6],
      [7, 4, 5, 3, 1, 6, 8, 9, 2],
    ];

    expect(isSafe(board, 0, 0, 1)).toBeTruthy();
  });
});

describe("generateSudoku", () => {
  it("generates a valid sudoku", () => {
    const board = generateSudoku();
    const boardWithMeta = toMetaBoard(board);

    expect(checkRow(board, 0)).toBeTruthy();
    expect(checkRow(board, 1)).toBeTruthy();
    expect(checkRow(board, 2)).toBeTruthy();
    expect(checkRow(board, 3)).toBeTruthy();
    expect(checkRow(board, 4)).toBeTruthy();
    expect(checkRow(board, 5)).toBeTruthy();
    expect(checkRow(board, 6)).toBeTruthy();
    expect(checkRow(board, 7)).toBeTruthy();
    expect(checkRow(board, 8)).toBeTruthy();

    expect(checkColumn(board, 0)).toBeTruthy();
    expect(checkColumn(board, 1)).toBeTruthy();
    expect(checkColumn(board, 2)).toBeTruthy();
    expect(checkColumn(board, 3)).toBeTruthy();
    expect(checkColumn(board, 4)).toBeTruthy();
    expect(checkColumn(board, 5)).toBeTruthy();
    expect(checkColumn(board, 6)).toBeTruthy();
    expect(checkColumn(board, 7)).toBeTruthy();
    expect(checkColumn(board, 8)).toBeTruthy();

    expect(checkBox(boardWithMeta, 0, 0)).toBeTruthy();
    expect(checkBox(boardWithMeta, 1, 1)).toBeTruthy();
    expect(checkBox(boardWithMeta, 2, 2)).toBeTruthy();
    expect(checkBox(boardWithMeta, 3, 3)).toBeTruthy();
    expect(checkBox(boardWithMeta, 4, 4)).toBeTruthy();
    expect(checkBox(boardWithMeta, 5, 5)).toBeTruthy();
    expect(checkBox(boardWithMeta, 6, 6)).toBeTruthy();
    expect(checkBox(boardWithMeta, 7, 7)).toBeTruthy();
    expect(checkBox(boardWithMeta, 8, 8)).toBeTruthy();
  });
});
