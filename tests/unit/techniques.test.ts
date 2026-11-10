import { describe, expect, it } from 'vitest';
import { formatGrid, parseGrid } from '../../src/lib/sudoku';
import { fewestOpenings, grade, nextPlacement } from '../../src/lib/techniques';
import { SET, XWING } from './fixtures';

describe('grade', () => {
  it.each([
    ['beginner', 1],
    ['intermediate', 1],
    ['advanced', 1],
  ] as const)('rates the %s Puzzle at level %i and reaches its solution', (difficulty, level) => {
    const result = grade(parseGrid(SET[difficulty].givens));
    expect(result).toMatchObject({ solved: true, level });
    expect(formatGrid(result.grid)).toBe(SET[difficulty].solution);
  });

  it('needs nothing but singles for Beginner', () => {
    expect(Object.keys(grade(parseGrid(SET.beginner.givens)).used).sort()).toEqual(['hidden-single']);
  });

  it('finds the X-Wing a harder grid needs', () => {
    expect(grade(parseGrid(XWING.givens))).toMatchObject({ solved: true, level: 3 });
    expect(grade(parseGrid(XWING.givens)).used['x-wing']).toBeGreaterThan(0);
  });

  it('gets stuck rather than guessing on a grid with many solutions', () => {
    expect(grade(Array(81).fill(0)).solved).toBe(false);
  });

  it('refuses a grid that repeats a digit', () => {
    const grid = parseGrid(SET.beginner.givens);
    grid[0] = 5;
    expect(grade(grid).solved).toBe(false);
  });

  it('calls a full grid solved at level 0', () => {
    expect(grade(parseGrid(SET.beginner.solution))).toMatchObject({ solved: true, level: 0 });
  });
});

describe('nextPlacement', () => {
  it('places a correct digit with a single on an easy grid', () => {
    const step = nextPlacement(parseGrid(SET.beginner.givens))!;
    expect(step.technique).toMatch(/single/);
    expect(step.via).toEqual([]);
    expect(String(step.digit)).toBe(SET.beginner.solution[step.index]);
  });

  it('says which harder techniques cleared the way', () => {
    // Play the X-Wing grid by logic until a placement needs more than singles.
    const grid = parseGrid(XWING.givens);
    let step = nextPlacement(grid);
    while (step && step.via.length === 0) {
      grid[step.index] = step.digit;
      step = nextPlacement(grid);
    }
    expect(step?.via.length).toBeGreaterThan(0);
    expect(String(step!.digit)).toBe(XWING.solution[step!.index]);
  });

  it('is null on a full grid', () => {
    expect(nextPlacement(parseGrid(SET.beginner.solution))).toBeNull();
  });
});

describe('fewestOpenings', () => {
  it('always leaves several cells on Beginner whose row, column and box show the rest', () => {
    expect(fewestOpenings(parseGrid(SET.beginner.givens), 'look')).toBeGreaterThanOrEqual(5);
  });

  it('always leaves several cells to find by scanning boxes on Intermediate', () => {
    expect(fewestOpenings(parseGrid(SET.intermediate.givens), 'box')).toBeGreaterThanOrEqual(3);
  });

  it('is null when that scan alone gets stuck', () => {
    expect(fewestOpenings(parseGrid(XWING.givens), 'look')).toBeNull();
    expect(fewestOpenings(parseGrid(XWING.givens), 'box')).toBeNull();
  });

  it('ignores the end, when every empty cell is open', () => {
    expect(fewestOpenings(parseGrid('.' + SET.beginner.solution.slice(1)), 'look')).toBe(Infinity);
  });
});
