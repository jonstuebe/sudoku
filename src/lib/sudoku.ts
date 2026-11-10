/**
 * Grid geometry and a brute-force solver. A grid is 81 numbers, row by row;
 * 0 is an empty cell. Candidates are 9-bit masks, bit d-1 for digit d.
 */

export type Grid = number[];

export const ALL = 0x1ff;

export const rowOf = (i: number) => Math.floor(i / 9);
export const colOf = (i: number) => i % 9;
export const boxOf = (i: number) => Math.floor(i / 27) * 3 + Math.floor((i % 9) / 3);

const range9 = [0, 1, 2, 3, 4, 5, 6, 7, 8];
export const ROWS = range9.map((r) => range9.map((c) => r * 9 + c));
export const COLS = range9.map((c) => range9.map((r) => r * 9 + c));
export const BOXES = range9.map((b) => range9.map((k) => (Math.floor(b / 3) * 3 + Math.floor(k / 3)) * 9 + (b % 3) * 3 + (k % 3)));
/** Every row, then every column, then every box. */
export const UNITS = [...ROWS, ...COLS, ...BOXES];

/** The 20 cells sharing a row, column or box with each cell. */
export const PEERS: number[][] = Array.from({ length: 81 }, (_, i) => {
  const set = new Set([...ROWS[rowOf(i)], ...COLS[colOf(i)], ...BOXES[boxOf(i)]]);
  set.delete(i);
  return [...set];
});

export const bit = (d: number) => 1 << (d - 1);

export function popcount(mask: number): number {
  let n = 0;
  for (let m = mask; m; m &= m - 1) n++;
  return n;
}

/** The digits in a candidate mask, ascending. */
export function digitsOf(mask: number): number[] {
  const out: number[] = [];
  for (let d = 1; d <= 9; d++) if (mask & bit(d)) out.push(d);
  return out;
}

export function parseGrid(text: string): Grid {
  return [...text].map((ch) => (ch >= '1' && ch <= '9' ? Number(ch) : 0));
}

export function formatGrid(grid: Grid): string {
  return grid.map((d) => (d ? String(d) : '.')).join('');
}

/** Digits still allowed in a cell, given what its peers hold. */
export function candidatesAt(grid: Grid, i: number): number {
  if (grid[i]) return 0;
  let used = 0;
  for (const p of PEERS[i]) if (grid[p]) used |= bit(grid[p]);
  return ALL & ~used;
}

/** True when no row, column or box repeats a digit. Empty cells are fine. */
export function isConsistent(grid: Grid): boolean {
  return UNITS.every((unit) => {
    let seen = 0;
    for (const i of unit) {
      const d = grid[i];
      if (!d) continue;
      if (seen & bit(d)) return false;
      seen |= bit(d);
    }
    return true;
  });
}

/**
 * Counts solutions up to `limit`, filling the first one found into `out`.
 * `random` shuffles digit order, so an empty grid gives a random full grid.
 */
export function countSolutions(grid: Grid, limit = 2, out?: Grid, random?: () => number): number {
  if (!isConsistent(grid)) return 0;
  const work = grid.slice();
  let found = 0;

  const search = (): boolean => {
    // Most constrained cell first.
    let best = -1;
    let bestMask = 0;
    let bestCount = 10;
    for (let i = 0; i < 81; i++) {
      if (work[i]) continue;
      const mask = candidatesAt(work, i);
      const n = popcount(mask);
      if (n === 0) return false;
      if (n < bestCount) {
        best = i;
        bestMask = mask;
        bestCount = n;
        if (n === 1) break;
      }
    }
    if (best === -1) {
      if (found === 0 && out) out.splice(0, 81, ...work);
      found++;
      return found >= limit;
    }
    const digits = digitsOf(bestMask);
    if (random) shuffle(digits, random);
    for (const d of digits) {
      work[best] = d;
      if (search()) return true;
    }
    work[best] = 0;
    return false;
  };

  search();
  return found;
}

/** The solution, or null when there are none. Doesn't check it's the only one. */
export function solve(grid: Grid): Grid | null {
  const out: Grid = [];
  return countSolutions(grid, 1, out) ? out : null;
}

export function shuffle<T>(items: T[], random: () => number): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
