import { observable } from "@legendapp/state";
import { copyBoard, getBoards, isNumberComplete } from "./logic";
import { Board, Difficulty, WinningAnimation } from "./types";

export type CellCoords = [number, number];
export type CellNotes = number[];

interface Store {
  selectedCell?: CellCoords;
  highlightedCells: CellCoords[];
  notes: Map<CellCoords, CellNotes>;
  mode: "normal" | "notes";
  /**
   * Current board (contains user values)
   */
  board: Board;
  /**
   * Board with only unfilled cells (used for resetting the board)
   */
  unfilledBoard: Board;
  /**
   * Solved board
   */
  solvedBoard: Board;
  startedAt?: Date;
  finishedAt?: Date;

  // settings
  showErrors: boolean;
  winningAnimation: WinningAnimation;

  resetBoard: VoidFunction;
  newGame: (difficulty: Difficulty) => void;
  displayNumber: (value: number) => void;
  isCellHighlighted: (coords: CellCoords) => boolean;
  isCellValid: (coords: CellCoords) => boolean;
  isCellEditable: (coords: CellCoords) => boolean;
  isNumberComplete: (value: number) => boolean;
  setValue: (coords: CellCoords | undefined, value: number) => void;
  setSelected: (coords: CellCoords) => void;
  toggleNote: (coords: CellCoords | undefined, note: number) => void;
  clearSelectedCell: VoidFunction;
  toggleMode: VoidFunction;
  gameComplete: VoidFunction;
  isGameComplete: () => boolean;
  validateGame: VoidFunction;
}

export const $store = observable<Store>({
  selectedCell: undefined,
  mode: "normal",
  winningAnimation: "Stars",
  notes: new Map<CellCoords, CellNotes>(),
  highlightedCells: [],
  ...getBoards("easy"),
  resetBoard: () => {
    const unfilledBoard = $store.unfilledBoard.get();
    $store.board.set(copyBoard(unfilledBoard));
    $store.startedAt.set(new Date());
  },
  newGame: (difficulty: Difficulty) => {
    const { board, solvedBoard, unfilledBoard } = getBoards(difficulty);

    $store.solvedBoard.set(solvedBoard);
    $store.board.set(board);
    $store.unfilledBoard.set(unfilledBoard);
    $store.startedAt.set(new Date());
    $store.selectedCell.set(undefined);
  },
  validateGame() {
    if ($store.isGameComplete()) {
      $store.gameComplete();
    }
  },
  displayNumber: (value: number) => {
    const highlightedCells: CellCoords[] = [];
    const board = $store.board.get();

    // loop through each row and column and check if cell value is equal to argument value
    // if it is, set the cell to highlighted
    for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
      for (let colIndex = 0; colIndex < 9; colIndex++) {
        if (board[rowIndex][colIndex] === value) {
          highlightedCells.push([rowIndex, colIndex]);
        }
      }
    }

    $store.highlightedCells.set(highlightedCells);
  },
  isCellHighlighted(coords: CellCoords) {
    let isCellHighlighted = false;
    const highlightedCells = $store.highlightedCells.get();

    highlightedCells.map((highlightedCell) => {
      if (
        highlightedCell[0] === coords[0] &&
        highlightedCell[1] === coords[1]
      ) {
        isCellHighlighted = true;
      }
    });

    return isCellHighlighted;
  },
  isGameComplete() {
    const board = $store.board.get();
    const solvedBoard = $store.solvedBoard.get();

    if (JSON.stringify(board) === JSON.stringify(solvedBoard)) {
      return true;
    }

    return false;
  },
  gameComplete() {
    $store.finishedAt.set(new Date());
  },
  isCellValid: (coords: CellCoords) => {
    const [row, col] = coords;
    const board = $store.board.get();
    const value = board[row][col];

    if (value === 0) {
      return false;
    }

    const solvedBoard = $store.solvedBoard.get();

    if (value === solvedBoard[row][col]) {
      return true;
    }

    return false;
  },
  isCellEditable(coords) {
    const [row, col] = coords;

    const unfilledBoard = $store.unfilledBoard.get();

    if (unfilledBoard[row][col] === 0) {
      return true;
    }

    return false;
  },
  isNumberComplete: (value: number) => {
    const board = $store.board.get();

    if (isNumberComplete(board, value)) {
      return true;
    }

    return false;
  },
  setValue: (coords, value) => {
    if (!coords) return;
    const highlightedCells = $store.highlightedCells.get();
    const [row, col] = coords;
    $store.board[row][col].set(value);

    if (highlightedCells.length > 0 && $store.isCellValid(coords)) {
      $store.displayNumber(value);
    }

    $store.validateGame();
  },
  setSelected: (coords) => {
    $store.selectedCell.set(coords);
    // $store.highlightedCells.set([]);
  },
  clearSelectedCell: () => {
    const selectedCell = $store.selectedCell.get();

    if (!selectedCell) return;

    const [row, col] = selectedCell;

    $store.board[row][col].set(0);
  },
  toggleMode: () => {
    const mode = $store.mode.get();
    $store.mode.set(mode === "normal" ? "notes" : "normal");
  },
  toggleNote: (coords, note) => {
    if (!coords) return;

    const notes = $store.notes.get();
    const cellNotes = notes.get(coords) ?? [];

    if (cellNotes.includes(note)) {
      $store.notes.set(
        coords,
        cellNotes.filter((n) => n !== note)
      );
    } else {
      $store.notes.set(coords, [...cellNotes, note].sort());
    }
  },

  startedAt: new Date(),

  showErrors: false,
});
