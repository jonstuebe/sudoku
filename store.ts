import { observable } from "@legendapp/state";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerDevMenuItems } from "expo-dev-menu";

import { clock$ } from "./clock";
import { games$ } from "./games";
import { copyBoard, fromMetaBoard, getBoards, toMetaBoard } from "./logic";
import { Board, BoardWithMeta, Difficulty, WinningAnimation } from "./types";
import { router } from "expo-router";
import { AppState } from "react-native";

export type CellCoords = [number, number];
export type CellNotes = number[];

interface Store {
  mode: "normal" | "notes";

  difficulty: Difficulty;
  cellSelected: CellCoords | undefined;
  cellPressed: CellCoords | undefined;
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
  highlightRowColumn: boolean;
  winningAnimation: WinningAnimation;

  numMoves: number;
  numErrors: number;

  resetBoard: VoidFunction;
  newGame: (difficulty?: Difficulty) => void;
  pauseGame: (status?: "app_inactive" | "app_event") => void;
  resumeGame: VoidFunction;
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

export const store$ = observable<Store>({
  mode: "normal",
  highlightRowColumn: true,
  winningAnimation: "Stars",
  difficulty: "easy",

  numMoves: 0,
  numErrors: 0,

  cellSelected: () => {
    let coords: CellCoords | undefined = undefined;

    store$.board.map((row, rowIndex) => {
      return row.map((cell, colIndex) => {
        if (cell.selected.get() === true) {
          coords = [rowIndex, colIndex];
        }
      });
    });

    return coords;
  },
  cellPressed: undefined,
  cellsHighlighted: undefined,
  status: "playing",
  startedAt: new Date(),
  showErrors: false,
  ...getBoards("easy"),
  resetBoard: () => {
    const unfilledBoard = store$.unfilledBoard.get();

    store$.numMoves.set(0);
    store$.numErrors.set(0);
    store$.board.set(toMetaBoard(copyBoard(unfilledBoard)));
    store$.status.set("playing");
    store$.startedAt.set(new Date());
    clock$.reset();
  },
  newGame: (difficulty?: Difficulty) => {
    if (difficulty === undefined) {
      difficulty = store$.difficulty.get();
    }
    const { board, solvedBoard, unfilledBoard } = getBoards(difficulty);

    store$.numMoves.set(0);
    store$.numErrors.set(0);
    store$.difficulty.set(difficulty);
    store$.solvedBoard.set(solvedBoard);
    store$.board.set(board);
    store$.unfilledBoard.set(unfilledBoard);
    store$.status.set("playing");
    store$.startedAt.set(new Date());
    clock$.reset();
  },
  validateGame() {
    if (store$.isGameComplete()) {
      store$.markGameAsComplete();
    }
  },
  setHighlighted: (value: number) => {
    if (value === 0) {
      store$.cellsHighlighted.set(undefined);
    } else {
      store$.cellsHighlighted.set(value);
    }

    store$.board.map((row, rowIndex) => {
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
    const board = store$.board.get();
    const solvedBoard = store$.solvedBoard.get();

    if (JSON.stringify(fromMetaBoard(board)) === JSON.stringify(solvedBoard)) {
      return true;
    }

    return false;
  },
  markGameAsComplete() {
    const difficulty = store$.difficulty.peek();
    const time = clock$.time.peek();
    const startedAt = store$.startedAt.peek();
    const numMoves = store$.numMoves.peek();
    const numErrors = store$.numErrors.peek();

    games$.addGame({
      difficulty,
      time,
      startedAt,
      numMoves,
      numErrors,
    });
    store$.status.set("complete");
    clock$.reset();
    router.push("completed");
  },
  pauseGame(status = "app_event") {
    clock$.pause();

    if (store$.status.get() === "playing" && status === "app_event") {
      router.push("paused");
    }
  },
  resumeGame() {
    clock$.resume();

    if (router.canGoBack()) {
      router.back();
    }
  },
  isNumberComplete: (value: number) => {
    const board = store$.board.get();

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

    store$.board.map((row, rowIndex) => {
      return row.map((cell, colIndex) => {
        if (
          rowIndex === coords[0] &&
          colIndex === coords[1] &&
          cell.editable.get() === true
        ) {
          cell.value.set(value);
          cell.valid.set(
            store$.solvedBoard[rowIndex][colIndex].get() === value
          );

          if (store$.cellsHighlighted.get() === value) {
            store$.setHighlighted(value);
          }

          store$.numMoves.set(store$.numMoves.get() + 1);

          if (store$.solvedBoard[coords[0]][coords[1]].get() !== value) {
            store$.numErrors.set(store$.numErrors.get() + 1);
          }
        }
      });
    });

    store$.validateGame();
  },
  setSelected: (coords) => {
    store$.board.map((row, rowIndex) => {
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
    store$.board.map((row, rowIndex) => {
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
    const mode = store$.mode.get();
    store$.mode.set(mode === "normal" ? "notes" : "normal");
  },
  toggleNote: (coords, note) => {
    if (!coords) return;

    store$.board.map((row, rowIndex) => {
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

store$.onChange(({ value }) => {
  AsyncStorage.setItem("showErrors", value.showErrors ? "true" : "false");
});

AsyncStorage.getItem("showErrors").then((value) => {
  if (value) {
    store$.showErrors.set(value === "true");
  }
});

AppState.addEventListener("change", (state) => {
  if (state !== "active") {
    store$.pauseGame("app_inactive");
  } else {
    store$.resumeGame();
  }
});

registerDevMenuItems([
  {
    name: "Fill In Cells",
    callback: () => {
      const solvedBoard = copyBoard(store$.solvedBoard.get());
      solvedBoard[0][0] = 0;
      store$.board.set(toMetaBoard(solvedBoard));
      store$.numMoves.set(40);
    },
  },
  {
    name: "Clear Previous Games",
    callback: () => {
      AsyncStorage.removeItem("games");
      games$.games.set([]);
    },
  },
]);
