import { describe, expect, it } from 'vitest';
import puzzles from '../../worker/puzzles.json';
import { countSolutions, isConsistent, parseGrid } from '../../src/lib/sudoku';
import { fewestOpenings, grade } from '../../src/lib/techniques';
import { DIFFICULTIES, type PuzzleSet } from '../../src/lib/types';
import { TARGETS, generateSet } from '../../scripts/generate';
import { dateOfPuzzle } from '../../worker/puzzles';
import { SET } from './fixtures';

const SETS = puzzles as PuzzleSet[];

describe('every shipped Puzzle', () => {
  it('runs at least a month', () => {
    expect(SETS.length).toBeGreaterThanOrEqual(30);
  });

  it.each(DIFFICULTIES)('%s: is well formed, unique, and graded at its difficulty', (difficulty) => {
    const problems: string[] = [];
    SETS.forEach((set, n) => {
      const { givens, solution } = set[difficulty];
      const grid = parseGrid(givens);
      const where = `#${n + 1} ${difficulty}`;
      if (!/^[1-9.]{81}$/.test(givens) || !/^[1-9]{81}$/.test(solution)) return problems.push(`${where}: malformed`);
      if (!isConsistent(parseGrid(solution))) problems.push(`${where}: solution repeats a digit`);
      if ([...givens].some((ch, i) => ch !== '.' && ch !== solution[i])) problems.push(`${where}: givens disagree with the solution`);
      if (countSolutions(grid) !== 1) problems.push(`${where}: not exactly one solution`);
      const result = grade(grid);
      if (!result.solved || result.level !== TARGETS[difficulty].level) problems.push(`${where}: graded level ${result.level}`);
      if (grid.filter(Boolean).length < TARGETS[difficulty].minGivens) problems.push(`${where}: too few givens`);
      const { openings } = TARGETS[difficulty];
      if (openings && (fewestOpenings(grid, openings.scan) ?? 0) < openings.min) problems.push(`${where}: too few cells open by ${openings.scan}`);
    });
    expect(problems).toEqual([]);
  });

  it('never repeats a grid', () => {
    const all = SETS.flatMap((set) => DIFFICULTIES.map((d) => set[d].solution));
    expect(new Set(all).size).toBe(all.length);
  });
});

describe('generateSet', () => {
  it('is the same for a date on every run, so the list can be regenerated', () => {
    expect(generateSet(dateOfPuzzle(1))).toEqual(SET);
    expect(SETS[0]).toEqual(SET);
  });
});
