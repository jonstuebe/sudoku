import type { Puzzle, PuzzleSet } from '../../src/lib/types';

/** Puzzles #1, as generated for 2026-11-10. */
export const SET: PuzzleSet = {
  beginner: {
    givens: '.5.493.7..97681.2...3..59487..8..36...51.72...28..4..55413..8...7.54863..8.719.5.',
    solution: '852493176497681523163275948714852369935167284628934715541326897279548631386719452',
  },
  intermediate: {
    givens: '.2396.78.81......2..9..85...5.2.91.898.7.5.461.78.6.9...81..4..3......17.71.5382.',
    solution: '523961784816574932749328561654239178982715346137846295268197453395482617471653829',
  },
  advanced: {
    givens: '...4.7..8.8.9.1..337...2.6....843.9..396.548..6.719....2.3...516..2.8.4.7..1.6...',
    solution: '596437218482961573371582964257843196139625487864719325928374651613258749745196832',
  },
};

/** A harder grid than any Difficulty ships: it needs an X-Wing. Hints still explain techniques like it. */
export const XWING: Puzzle = {
  givens: '.3..6..5.1..5....9.95..3......3...9.2..9.1..7.4...2......7..54.7....5..8.1..9..6.',
  solution: '837469152126587439495213876671358294253941687948672315389726541764135928512894763',
};

/** A Puzzle with only the first `blanks` cells of a solution left to fill. */
export function nearlyDone(blanks: number, solution = SET.beginner.solution): Puzzle {
  return { givens: '.'.repeat(blanks) + solution.slice(blanks), solution };
}

/** A localStorage stand-in: no jsdom quirks, and inspectable. */
export function memoryStorage(initial: Record<string, string> = {}): Storage {
  const map = new Map(Object.entries(initial));
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key) => map.get(key) ?? null,
    key: (index) => [...map.keys()][index] ?? null,
    removeItem: (key) => void map.delete(key),
    setItem: (key, value) => void map.set(key, String(value)),
  };
}

/** A storage that refuses everything, like Safari private mode. */
export function blockedStorage(): Storage {
  const throwing = () => {
    throw new Error('Storage blocked');
  };
  return { length: 0, clear: throwing, getItem: throwing, key: throwing, removeItem: throwing, setItem: throwing };
}
