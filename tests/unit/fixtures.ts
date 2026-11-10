import type { Puzzle, PuzzleSet } from '../../src/lib/types';

/** Puzzles #1, as generated for 2026-11-10. The advanced one needs an X-Wing. */
export const SET: PuzzleSet = {
  beginner: {
    givens: '.5..93.7..97.81.2...3..5.487..8...6...51.72...2...4..554.3..8...7.54.63..8.71..5.',
    solution: '852493176497681523163275948714852369935167284628934715541326897279548631386719452',
  },
  intermediate: {
    givens: '....59.3...7..8..5..3...46.4...8..9..72.9.84..3..7...2.68...2..2..8..9...9.64....',
    solution: '126459738947368125583721469415286397672593841839174652368915274254837916791642583',
  },
  advanced: {
    givens: '.3..6..5.1..5....9.95..3......3...9.2..9.1..7.4...2......7..54.7....5..8.1..9..6.',
    solution: '837469152126587439495213876671358294253941687948672315389726541764135928512894763',
  },
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
