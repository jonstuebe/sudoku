import { countSolutions, formatGrid, shuffle, type Grid } from '../src/lib/sudoku.ts';
import { grade, type Level } from '../src/lib/techniques.ts';
import type { Difficulty, Puzzle, PuzzleSet } from '../src/lib/types.ts';

/** What each difficulty asks of a Puzzle: the hardest technique it needs, and how sparse it may get. */
export const TARGETS: Record<Difficulty, { level: Level; minGivens: number }> = {
  beginner: { level: 1, minGivens: 36 },
  intermediate: { level: 2, minGivens: 28 },
  advanced: { level: 3, minGivens: 22 },
};

/** A seeded PRNG (mulberry32), so a date always generates the same Puzzles. */
export function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomSolution(random: () => number): Grid {
  const out: Grid = [];
  countSolutions(Array(81).fill(0), 1, out, random);
  return out;
}

/**
 * Empties cells in 180°-symmetric pairs, keeping each removal only while
 * logic up to `level` still solves the grid (which also keeps it unique).
 */
function dig(solution: Grid, level: Level, minGivens: number, random: () => number): Grid {
  const grid = solution.slice();
  let givens = 81;
  const order = shuffle(
    Array.from({ length: 41 }, (_, i) => i),
    random,
  );
  for (const i of order) {
    const pair = i === 40 ? [40] : [i, 80 - i];
    if (givens - pair.length < minGivens) continue;
    for (const p of pair) grid[p] = 0;
    const result = grade(grid);
    if (result.solved && result.level <= level) givens -= pair.length;
    else for (const p of pair) grid[p] = solution[p];
  }
  return grid;
}

/** One Puzzle whose hardest technique is exactly the difficulty's level. */
export function generatePuzzle(difficulty: Difficulty, random: () => number): Puzzle {
  const { level, minGivens } = TARGETS[difficulty];
  for (;;) {
    const solution = randomSolution(random);
    const givens = dig(solution, level, minGivens, random);
    if (grade(givens).level === level) return { givens: formatGrid(givens), solution: formatGrid(solution) };
  }
}

/** The three Puzzles for a date key, the same on every run. */
export function generateSet(date: string): PuzzleSet {
  const random = seededRandom(`sudoku:${date}`);
  return {
    beginner: generatePuzzle('beginner', random),
    intermediate: generatePuzzle('intermediate', random),
    advanced: generatePuzzle('advanced', random),
  };
}
