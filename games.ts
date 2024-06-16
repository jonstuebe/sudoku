import { observable } from "@legendapp/state";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { parseISO } from "date-fns";

import type { Difficulty } from "./types";

export type Game = {
  difficulty: Difficulty;
  startedAt: Date;
  time: string;
};

export type Games = {
  selectedDifficulty: Difficulty;
  games: Game[];
  sortedGames: Game[];

  addGame: (game: Game) => void;
  removeGame: (game: Game) => void;
};

export const games$ = observable<Games>({
  selectedDifficulty: "easy",
  games: [],
  sortedGames: () => {
    return games$.games
      .get()
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  },
  addGame: (game) => {
    games$.games.push(game);
    games$.selectedDifficulty.set(game.difficulty);
  },
  removeGame: (game) => {
    games$.games
      .find((g) => {
        return (
          g.difficulty.get() === game.difficulty && g.time.get() === game.time
        );
      })
      ?.delete();
  },
});

syncGames();
games$.onChange(({ value: { games } }) => {
  const serialized = games.map((game) => {
    return {
      difficulty: game.difficulty,
      time: game.time,
      startedAt: game.startedAt.toISOString(),
    };
  });

  AsyncStorage.setItem("games", JSON.stringify(serialized));
});

async function syncGames() {
  try {
    const serialized = await AsyncStorage.getItem("games");
    if (serialized) {
      const games = (JSON.parse(serialized) as any[]).map((game) => {
        return {
          difficulty: game.difficulty,
          startedAt: parseISO(game.startedAt),
          time: game.time,
        };
      });

      games$.games.set(games);
    }
  } catch (e) {
    console.log(e);
  }
}

// function getGameLength(game: Game): string {
//   const seconds = differenceInSeconds(game.finishedAt, game.startedAt);
//   const minutes = Math.floor(seconds / 60);
//   const hours = Math.floor(minutes / 60);

//   if (hours === 0) {
//     return `00:${String(minutes % 60).padStart(2, "0")}:${String(
//       seconds % 60
//     ).padStart(2, "0")}`;
//   }

//   return `${String(hours).padStart(2, "0")}:${String(minutes % 60).padStart(
//     2,
//     "0"
//   )}:${String(seconds % 60).padStart(2, "0")}`;
// }
