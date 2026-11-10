import { countSolutions, formatGrid, shuffle, type Grid } from '../src/lib/sudoku.ts';
import { fewestOpenings, grade, type Level, type Scan } from '../src/lib/techniques.ts';
import { DIFFICULTIES, type Difficulty, type Puzzle, type PuzzleSet } from '../src/lib/types.ts';

interface Target {
  /** The hardest technique it needs. */
  level: Level;
  /** How sparse it may get. */
  minGivens: number;
  /** When set, that Scan alone solves it and always has at least `min` cells open. */
  openings?: { scan: Scan; min: number };
}

/** What each difficulty asks of a Puzzle. */
export const TARGETS: Record<Difficulty, Target> = {
  beginner: { level: 1, minGivens: 44, openings: { scan: 'look', min: 5 } },
  intermediate: { level: 1, minGivens: 40, openings: { scan: 'box', min: 3 } },
  advanced: { level: 1, minGivens: 36 },
};

/** Whether a grid meets a difficulty's target, or is still easier than it. */
function fits(grid: Grid, { level, openings }: Target): boolean {
  if (openings) return (fewestOpenings(grid, openings.scan) ?? 0) >= openings.min;
  const result = grade(grid);
  return result.solved && result.level <= level;
}

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
 * the grid still fits the target (logic solving it also keeps it unique).
 */
function dig(solution: Grid, target: Target, random: () => number): Grid {
  const grid = solution.slice();
  let givens = 81;
  const order = shuffle(
    Array.from({ length: 41 }, (_, i) => i),
    random,
  );
  for (const i of order) {
    const pair = i === 40 ? [40] : [i, 80 - i];
    if (givens - pair.length < target.minGivens) continue;
    for (const p of pair) grid[p] = 0;
    if (fits(grid, target)) givens -= pair.length;
    else for (const p of pair) grid[p] = solution[p];
  }
  return grid;
}

/** One Puzzle whose hardest technique is exactly the difficulty's level. */
export function generatePuzzle(difficulty: Difficulty, random: () => number): Puzzle {
  const target = TARGETS[difficulty];
  for (;;) {
    const solution = randomSolution(random);
    const givens = dig(solution, target, random);
    if (grade(givens).level === target.level) return { givens: formatGrid(givens), solution: formatGrid(solution) };
  }
}

/** The three Puzzles for a date key, the same on every run. */
export function generateSet(date: string): PuzzleSet {
  const random = seededRandom(`sudoku:${date}`);
  return Object.fromEntries(DIFFICULTIES.map((d) => [d, generatePuzzle(d, random)])) as PuzzleSet;
}
