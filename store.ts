import { observable } from "@legendapp/state";
import { registerDevMenuItems } from "expo-dev-menu";
import { copyBoard, fromMetaBoard, getBoards, toMetaBoard } from "./logic";
import { Board, BoardWithMeta, Difficulty, WinningAnimation } from "./types";
import { $games } from "./games";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { $clock } from "./clock";

export type CellCoords = [number, number];
export type CellNotes = number[];

interface Store {
  mode: "normal" | "notes";

  difficulty: Difficulty;
  cellSelected: CellCoords | undefined;
  cellsHighlighted: number | undefined;
  /**
   * Current board (contains user values)
   */
  board: BoardWithMeta;
  /**
   * Board with only unfilled cells (used for resetting the board)
   */
  unfilledBoard: Board;
  /**
   * Solved board
   */
  solvedBoard: Board;
  status: "playing" | "complete";
  startedAt: Date;

  // settings
  showErrors: boolean;
  winningAnimation: WinningAnimation;

  resetBoard: VoidFunction;
  newGame: (difficulty: Difficulty) => void;
  setHighlighted: (value: number) => void;
  isNumberComplete: (value: number) => boolean;
  setValue: (coords: CellCoords | undefined, value: number) => void;
  setSelected: (coords: CellCoords) => void;
  toggleNote: (coords: CellCoords | undefined, note: number) => void;
  clearSelectedCell: VoidFunction;
  toggleMode: VoidFunction;
  markGameAsComplete: VoidFunction;
  isGameComplete: () => boolean;
  validateGame: VoidFunction;
}

export const $store = observable<Store>({
  mode: "normal",
  winningAnimation: "Stars",
  difficulty: "easy",
  cellSelected: () => {
    let coords: CellCoords | undefined = undefined;

    $store.board.map((row, rowIndex) => {
      return row.map((cell, colIndex) => {
        if (cell.selected.get() === true) {
          coords = [rowIndex, colIndex];
        }
      });
    });

    return coords;
  },
  cellsHighlighted: undefined,
  status: "playing",
  startedAt: new Date(),
  showErrors: false,
  ...getBoards("easy"),
  resetBoard: () => {
    const unfilledBoard = $store.unfilledBoard.get();
    $store.board.set(toMetaBoard(copyBoard(unfilledBoard)));
    $store.status.set("playing");
    $store.startedAt.set(new Date());
    $clock.reset();
  },
  newGame: (difficulty: Difficulty) => {
    const { board, solvedBoard, unfilledBoard } = getBoards(difficulty);

    $store.difficulty.set(difficulty);
    $store.solvedBoard.set(solvedBoard);
    $store.board.set(board);
    $store.unfilledBoard.set(unfilledBoard);
    $store.status.set("playing");
    $store.startedAt.set(new Date());
    $clock.reset();
  },
  validateGame() {
    if ($store.isGameComplete()) {
      $store.markGameAsComplete();
    }
  },
  setHighlighted: (value: number) => {
    if (value === 0) {
      $store.cellsHighlighted.set(undefined);
    } else {
      $store.cellsHighlighted.set(value);
    }

    $store.board.map((row, rowIndex) => {
      return row.map((cell, colIndex) => {
        if (cell.value.get() === value && value !== 0) {
          cell.highlighted.set(true);
        } else {
          cell.highlighted.set(false);
        }
      });
    });
  },

  isGameComplete() {
    const board = $store.board.get();
    const solvedBoard = $store.solvedBoard.get();

    if (JSON.stringify(fromMetaBoard(board)) === JSON.stringify(solvedBoard)) {
      return true;
    }

    return false;
  },
  markGameAsComplete() {
    const difficulty = $store.difficulty.get();
    const time = $clock.time.get();
    const startedAt = $store.startedAt.get();

    $clock.pause();
    $games.addGame({
      difficulty,
      time,
      startedAt,
    });
    $store.status.set("complete");
  },
  isNumberComplete: (value: number) => {
    const board = $store.board.get();

    if (value === 0) {
      return false;
    }

    let instances: number = 0;

    // check to see if there are 9 instances of the value on the board
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j].value === value) {
          instances++;
        }
      }
    }

    if (instances === 9) {
      return true;
    }

    return false;
  },
  setValue: (coords, value) => {
    if (!coords) return;

    $store.board.map((row, rowIndex) => {
      return row.map((cell, colIndex) => {
        if (
          rowIndex === coords[0] &&
          colIndex === coords[1] &&
          cell.editable.get() === true
        ) {
          cell.value.set(value);
          cell.valid.set(
            $store.solvedBoard[rowIndex][colIndex].get() === value
          );

          if ($store.cellsHighlighted.get() === value) {
            $store.setHighlighted(value);
          }
        }
      });
    });

    $store.validateGame();
  },
  setSelected: (coords) => {
    $store.board.map((row, rowIndex) => {
      return row.map((cell, colIndex) => {
        if (rowIndex === coords[0] && colIndex === coords[1]) {
          cell.selected.set(true);
        } else {
          cell.selected.set(false);
        }
      });
    });
  },
  clearSelectedCell: () => {
    $store.board.map((row, rowIndex) => {
      return row.map((cell, colIndex) => {
        if (cell.selected.get() === true) {
          cell.value.set(0);
          if (cell.highlighted.get() === true) {
            cell.highlighted.set(false);
          }
        }
      });
    });
  },
  toggleMode: () => {
    const mode = $store.mode.get();
    $store.mode.set(mode === "normal" ? "notes" : "normal");
  },
  toggleNote: (coords, note) => {
    if (!coords) return;

    $store.board.map((row, rowIndex) => {
      return row.map((cell, colIndex) => {
        if (rowIndex === coords[0] && colIndex === coords[1]) {
          const notes = cell.notes.get();

          if (notes.includes(note)) {
            cell.notes.set(notes.filter((n) => n !== note));
          } else {
            cell.notes.set([...notes, note].sort());
          }
        } else {
        }
      });
    });
  },
});

registerDevMenuItems([
  {
    name: "Fill In Cells",
    callback: () => {
      const solvedBoard = copyBoard($store.solvedBoard.get());
      solvedBoard[0][0] = 0;
      $store.board.set(toMetaBoard(solvedBoard));
    },
  },
  {
    name: "Clear Previous Games",
    callback: () => {
      AsyncStorage.removeItem("games");
      $games.games.set([]);
    },
  },
]);
