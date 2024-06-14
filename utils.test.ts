import { toMetaBoard } from "./logic";
import {
  checkRow,
  getColumn,
  getBoxByCoords,
  checkBox,
  checkColumn,
  generateEmptyBoard,
  chunkArray,
} from "./utils";

describe("checkRow", () => {
  it("returns true if the row is valid", () => {
    const board = generateEmptyBoard();

    board[0] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    expect(checkRow(board, 0)).toEqual(true);
  });

  it("returns false if the row is invalid", () => {
    const board = generateEmptyBoard();

    // empty value in last cell
    board[0] = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    // duplicate 2's in the row
    board[1] = [1, 2, 3, 4, 5, 6, 7, 8, 2];

    expect(checkRow(board, 0)).toEqual(false);
    expect(checkRow(board, 1)).toEqual(false);
  });
});

describe("checkColumn", () => {
  it("returns true if the column is valid", () => {
    const board = generateEmptyBoard();

    board[0] = [1, 0, 0, 0, 0, 0, 0, 0, 0];
    board[1] = [2, 0, 0, 0, 0, 0, 0, 0, 0];
    board[2] = [3, 0, 0, 0, 0, 0, 0, 0, 0];
    board[3] = [4, 0, 0, 0, 0, 0, 0, 0, 0];
    board[4] = [5, 0, 0, 0, 0, 0, 0, 0, 0];
    board[5] = [6, 0, 0, 0, 0, 0, 0, 0, 0];
    board[6] = [7, 0, 0, 0, 0, 0, 0, 0, 0];
    board[7] = [8, 0, 0, 0, 0, 0, 0, 0, 0];
    board[8] = [9, 0, 0, 0, 0, 0, 0, 0, 0];

    expect(checkColumn(board, 0)).toEqual(true);
    expect(checkColumn(board, 1)).toEqual(false);
    expect(checkColumn(board, 2)).toEqual(false);
    expect(checkColumn(board, 3)).toEqual(false);
    expect(checkColumn(board, 4)).toEqual(false);
    expect(checkColumn(board, 5)).toEqual(false);
    expect(checkColumn(board, 6)).toEqual(false);
    expect(checkColumn(board, 7)).toEqual(false);
    expect(checkColumn(board, 8)).toEqual(false);
  });
});

describe("checkBox", () => {
  it("returns true if the box is valid", () => {
    const board = generateEmptyBoard();

    board[0] = [0, 0, 0, 1, 2, 3, 0, 0, 0];
    board[1] = [0, 0, 0, 4, 5, 6, 0, 0, 0];
    board[2] = [0, 0, 0, 7, 8, 9, 0, 0, 0];

    const boardWithMeta = toMetaBoard(board);

    expect(checkBox(boardWithMeta, 0, 0)).toEqual(false);
    expect(checkBox(boardWithMeta, 1, 3)).toEqual(true);
  });

  it("returns false if the box is invalid", () => {
    const board = toMetaBoard(generateEmptyBoard());

    expect(checkBox(board, 0, 0)).toEqual(false);
  });
});

describe("getBoxByCoords", () => {
  it("returns the correct box", () => {
    const board = generateEmptyBoard();

    board[0] = [0, 0, 0, 1, 2, 3, 0, 0, 0];
    board[1] = [0, 0, 0, 4, 5, 6, 0, 0, 0];
    board[2] = [0, 0, 0, 7, 8, 9, 0, 0, 0];

    const boardWithMeta = toMetaBoard(board);

    const getDefaultCell = (value: number) => {
      return {
        value,
        highlighted: false,
        notes: [],
        selected: false,
        valid: value !== 0,
        editable: value === 0,
      };
    };
    expect(getBoxByCoords(boardWithMeta, [0, 0])).toEqual([
      [getDefaultCell(0), getDefaultCell(0), getDefaultCell(0)],
      [getDefaultCell(0), getDefaultCell(0), getDefaultCell(0)],
      [getDefaultCell(0), getDefaultCell(0), getDefaultCell(0)],
    ]);

    expect(getBoxByCoords(boardWithMeta, [1, 4])).toEqual([
      [getDefaultCell(1), getDefaultCell(2), getDefaultCell(3)],
      [getDefaultCell(4), getDefaultCell(5), getDefaultCell(6)],
      [getDefaultCell(7), getDefaultCell(8), getDefaultCell(9)],
    ]);
  });
});

describe("getColumn", () => {
  it("returns a column as an array", () => {
    const board = generateEmptyBoard();

    expect(getColumn(board, 0)).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);

    board[0] = [1, 0, 0, 0, 0, 0, 0, 0, 0];

    expect(getColumn(board, 0)).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 0]);

    board[1] = [1, 2, 0, 0, 0, 0, 0, 0, 0];

    expect(getColumn(board, 0)).toEqual([1, 1, 0, 0, 0, 0, 0, 0, 0]);
    expect(getColumn(board, 1)).toEqual([0, 2, 0, 0, 0, 0, 0, 0, 0]);
  });
});

describe("chunkArray", () => {
  it("splits an array into chunks", () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    expect(chunkArray(array, 3)).toEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
  });
});
