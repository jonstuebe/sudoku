import { observable } from "@legendapp/state";
import { copyBoard, getBoards, isNumberComplete } from "./logic";
import { Board, Difficulty, WinningAnimation } from "./types";

export type CellCoords = [number, number];
export type CellNotes = number[];

interface Store {
  selectedCell?: CellCoords;
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
  isCellValid: (coords: CellCoords) => boolean;
  isCellEditable: (coords: CellCoords) => boolean;
  isNumberComplete: (value: number) => boolean;
  setValue: (coords: CellCoords | undefined, value: number) => void;
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
    const [row, col] = coords;
    $store.board[row][col].set(value);
    $store.validateGame();
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
