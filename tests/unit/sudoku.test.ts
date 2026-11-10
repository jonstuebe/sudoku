import { describe, expect, it } from 'vitest';
import { BOXES, PEERS, UNITS, boxOf, candidatesAt, countSolutions, digitsOf, formatGrid, isConsistent, parseGrid, solve } from '../../src/lib/sudoku';
import { seededRandom } from '../../scripts/generate';
import { SET } from './fixtures';

describe('geometry', () => {
  it('has 27 units of 9 and 20 peers per cell', () => {
    expect(UNITS).toHaveLength(27);
    expect(UNITS.every((u) => new Set(u).size === 9)).toBe(true);
    expect(PEERS.every((p) => p.length === 20)).toBe(true);
  });

  it('numbers boxes left to right, top to bottom', () => {
    expect(boxOf(0)).toBe(0);
    expect(boxOf(8)).toBe(2);
    expect(boxOf(40)).toBe(4);
    expect(boxOf(80)).toBe(8);
    expect(BOXES[4]).toEqual([30, 31, 32, 39, 40, 41, 48, 49, 50]);
  });
});

describe('grids', () => {
  it('round-trips between text and numbers', () => {
    expect(formatGrid(parseGrid(SET.advanced.givens))).toBe(SET.advanced.givens);
  });

  it('lists what a cell can still hold', () => {
    const grid = parseGrid(SET.beginner.solution);
    grid[0] = 0;
    expect(digitsOf(candidatesAt(grid, 0))).toEqual([8]);
  });

  it('spots a repeated digit', () => {
    const grid = parseGrid(SET.beginner.givens);
    expect(isConsistent(grid)).toBe(true);
    grid[0] = 5; // row 1 already has a 5
    expect(isConsistent(grid)).toBe(false);
  });
});

describe('countSolutions', () => {
  it('finds exactly one for a real Puzzle, and fills it in', () => {
    const out: number[] = [];
    expect(countSolutions(parseGrid(SET.advanced.givens), 2, out)).toBe(1);
    expect(formatGrid(out)).toBe(SET.advanced.solution);
  });

  it('stops at the limit for a grid with many', () => {
    expect(countSolutions(Array(81).fill(0), 2)).toBe(2);
  });

  it('finds none for a broken grid', () => {
    const grid = parseGrid(SET.beginner.givens);
    grid[0] = 5;
    expect(countSolutions(grid)).toBe(0);
    expect(solve(grid)).toBeNull();
  });

  it('builds a random full grid when shuffled', () => {
    const out: number[] = [];
    countSolutions(Array(81).fill(0), 1, out, seededRandom('x'));
    expect(out.every(Boolean)).toBe(true);
    expect(isConsistent(out)).toBe(true);
  });
});
