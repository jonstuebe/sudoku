import { BOXES, COLS, PEERS, ROWS, UNITS, bit, boxOf, candidatesAt, colOf, digitsOf, isConsistent, popcount, rowOf, type Grid } from './sudoku.ts';

/**
 * A solver that only uses deductions a person makes, easiest first. How hard
 * the hardest one it needed is decides a Puzzle's difficulty, and the next
 * placement it finds is what a Hint reveals.
 */

export type Technique =
  | 'hidden-single'
  | 'naked-single'
  | 'locked-candidates'
  | 'naked-pair'
  | 'hidden-pair'
  | 'naked-triple'
  | 'hidden-triple'
  | 'naked-quad'
  | 'x-wing'
  | 'xy-wing'
  | 'swordfish';

export type Level = 1 | 2 | 3;

/** 1 is Beginner, 2 Intermediate, 3 Advanced. */
export const TECHNIQUE_LEVEL: Record<Technique, Level> = {
  'hidden-single': 1,
  'naked-single': 1,
  'locked-candidates': 2,
  'naked-pair': 2,
  'hidden-pair': 2,
  'naked-triple': 2,
  'hidden-triple': 3,
  'naked-quad': 3,
  'x-wing': 3,
  'xy-wing': 3,
  swordfish: 3,
};

export const TECHNIQUE_NAMES: Record<Technique, string> = {
  'hidden-single': 'Hidden single',
  'naked-single': 'Naked single',
  'locked-candidates': 'Locked candidates',
  'naked-pair': 'Naked pair',
  'hidden-pair': 'Hidden pair',
  'naked-triple': 'Naked triple',
  'hidden-triple': 'Hidden triple',
  'naked-quad': 'Naked quad',
  'x-wing': 'X-Wing',
  'xy-wing': 'XY-Wing',
  swordfish: 'Swordfish',
};

interface Board {
  values: Grid;
  /** Candidate masks; 0 for a filled cell. */
  cands: number[];
}

interface Placement {
  index: number;
  digit: number;
}

/** A placement, or true when it only ruled candidates out, or false when it found nothing. */
type Finder = (b: Board) => Placement | boolean;

function boardFrom(grid: Grid): Board {
  return { values: grid.slice(), cands: grid.map((_, i) => candidatesAt(grid, i)) };
}

function place(b: Board, index: number, digit: number): Placement {
  b.values[index] = digit;
  b.cands[index] = 0;
  for (const p of PEERS[index]) b.cands[p] &= ~bit(digit);
  return { index, digit };
}

function eliminate(b: Board, cells: number[], mask: number): boolean {
  let changed = false;
  for (const i of cells) {
    if (b.cands[i] & mask) {
      b.cands[i] &= ~mask;
      changed = true;
    }
  }
  return changed;
}

function* combinations<T>(items: T[], k: number, start = 0, picked: T[] = []): Generator<T[]> {
  if (picked.length === k) {
    yield picked;
    return;
  }
  for (let i = start; i <= items.length - (k - picked.length); i++) yield* combinations(items, k, i + 1, [...picked, items[i]]);
}

/** A digit with only one place left in a row, column or box. */
const hiddenSingle: Finder = (b) => {
  for (const unit of UNITS) {
    for (let d = 1; d <= 9; d++) {
      let spot = -1;
      let count = 0;
      for (const i of unit) {
        if (b.cands[i] & bit(d)) {
          spot = i;
          count++;
        }
      }
      if (count === 1) return place(b, spot, d);
    }
  }
  return false;
};

/** A cell with only one digit left. */
const nakedSingle: Finder = (b) => {
  for (let i = 0; i < 81; i++) {
    if (popcount(b.cands[i]) === 1) return place(b, i, digitsOf(b.cands[i])[0]);
  }
  return false;
};

/** Pointing and claiming: a digit confined to where a box and a line cross. */
const lockedCandidates: Finder = (b) => {
  for (let box = 0; box < 9; box++) {
    for (let d = 1; d <= 9; d++) {
      const cells = BOXES[box].filter((i) => b.cands[i] & bit(d));
      if (cells.length < 2) continue;
      const rows = new Set(cells.map(rowOf));
      if (rows.size === 1 && eliminate(b, ROWS[rowOf(cells[0])].filter((i) => boxOf(i) !== box), bit(d))) return true;
      const cols = new Set(cells.map(colOf));
      if (cols.size === 1 && eliminate(b, COLS[colOf(cells[0])].filter((i) => boxOf(i) !== box), bit(d))) return true;
    }
  }
  for (const line of [...ROWS, ...COLS]) {
    for (let d = 1; d <= 9; d++) {
      const cells = line.filter((i) => b.cands[i] & bit(d));
      if (cells.length < 2) continue;
      const boxes = new Set(cells.map(boxOf));
      if (boxes.size === 1 && eliminate(b, BOXES[boxOf(cells[0])].filter((i) => !line.includes(i)), bit(d))) return true;
    }
  }
  return false;
};

/** k cells in a unit that hold only k digits between them: no other cell there can have those digits. */
const nakedSubset =
  (k: number): Finder =>
  (b) => {
    for (const unit of UNITS) {
      const open = unit.filter((i) => b.cands[i]);
      if (open.length <= k) continue;
      const pool = open.filter((i) => popcount(b.cands[i]) <= k);
      for (const combo of combinations(pool, k)) {
        const union = combo.reduce((m, i) => m | b.cands[i], 0);
        if (popcount(union) === k && eliminate(b, open.filter((i) => !combo.includes(i)), union)) return true;
      }
    }
    return false;
  };

/** k digits that fit only in the same k cells of a unit: those cells can hold nothing else. */
const hiddenSubset =
  (k: number): Finder =>
  (b) => {
    for (const unit of UNITS) {
      const spots: { mask: number; cells: number }[] = [];
      for (let d = 1; d <= 9; d++) {
        let cells = 0;
        unit.forEach((i, pos) => {
          if (b.cands[i] & bit(d)) cells |= 1 << pos;
        });
        const n = popcount(cells);
        if (n >= 2 && n <= k) spots.push({ mask: bit(d), cells });
      }
      for (const combo of combinations(spots, k)) {
        const cells = combo.reduce((m, s) => m | s.cells, 0);
        if (popcount(cells) !== k) continue;
        const keep = combo.reduce((m, s) => m | s.mask, 0);
        const targets = unit.filter((_, pos) => cells & (1 << pos));
        if (eliminate(b, targets, ~keep & 0x1ff)) return true;
      }
    }
    return false;
  };

/** X-Wing (size 2) and Swordfish (size 3): a digit confined to the same columns across rows, or vice versa. */
const fish =
  (size: number): Finder =>
  (b) => {
    for (let d = 1; d <= 9; d++) {
      for (const [base, cover] of [
        [ROWS, COLS],
        [COLS, ROWS],
      ]) {
        const lines: { line: number; spots: number }[] = [];
        base.forEach((cells, line) => {
          let spots = 0;
          cells.forEach((i, pos) => {
            if (b.cands[i] & bit(d)) spots |= 1 << pos;
          });
          const n = popcount(spots);
          if (n >= 2 && n <= size) lines.push({ line, spots });
        });
        for (const combo of combinations(lines, size)) {
          const spots = combo.reduce((m, l) => m | l.spots, 0);
          if (popcount(spots) !== size) continue;
          const inBase = new Set(combo.flatMap((l) => base[l.line]));
          const targets = cover.filter((_, pos) => spots & (1 << pos)).flatMap((cells) => cells.filter((i) => !inBase.has(i)));
          if (eliminate(b, targets, bit(d))) return true;
        }
      }
    }
    return false;
  };

/** A two-digit pivot {a,b} seeing pincers {a,c} and {b,c}: any cell seeing both pincers can't be c. */
const xyWing: Finder = (b) => {
  for (let pivot = 0; pivot < 81; pivot++) {
    const x = b.cands[pivot];
    if (popcount(x) !== 2) continue;
    const pincers = PEERS[pivot].filter((p) => popcount(b.cands[p]) === 2 && popcount(b.cands[p] & x) === 1);
    for (const [p1, p2] of combinations(pincers, 2)) {
      const y = b.cands[p1];
      const z = b.cands[p2];
      const c = y & z;
      if ((x & y) === (x & z) || popcount(c) !== 1 || c & x) continue;
      const seesBoth = PEERS[p1].filter((i) => i !== p2 && PEERS[p2].includes(i));
      if (eliminate(b, seesBoth, c)) return true;
    }
  }
  return false;
};

const FINDERS: [Technique, Finder][] = [
  ['hidden-single', hiddenSingle],
  ['naked-single', nakedSingle],
  ['locked-candidates', lockedCandidates],
  ['naked-pair', nakedSubset(2)],
  ['hidden-pair', hiddenSubset(2)],
  ['naked-triple', nakedSubset(3)],
  ['hidden-triple', hiddenSubset(3)],
  ['naked-quad', nakedSubset(4)],
  ['x-wing', fish(2)],
  ['xy-wing', xyWing],
  ['swordfish', fish(3)],
];

/** Applies the easiest technique that makes progress. */
function nextDeduction(b: Board): { technique: Technique; placement: Placement | null } | null {
  for (const [technique, find] of FINDERS) {
    const found = find(b);
    if (found) return { technique, placement: found === true ? null : found };
  }
  return null;
}

export interface Grade {
  /** False when these techniques get stuck, or the grid is broken. */
  solved: boolean;
  /** The hardest technique's level; 0 for a grid that was already full. */
  level: Level | 0;
  /** How often each technique was needed. */
  used: Partial<Record<Technique, number>>;
  /** As far as logic got. */
  grid: Grid;
}

/**
 * Solves by logic alone. Every deduction is sound, so reaching a full grid
 * also proves the solution is unique.
 */
export function grade(grid: Grid): Grade {
  const used: Partial<Record<Technique, number>> = {};
  let level: Level | 0 = 0;
  if (!isConsistent(grid)) return { solved: false, level, used, grid };
  const b = boardFrom(grid);
  for (;;) {
    if (b.values.every(Boolean)) return { solved: true, level, used, grid: b.values };
    const step = nextDeduction(b);
    if (!step) return { solved: false, level, used, grid: b.values };
    used[step.technique] = (used[step.technique] ?? 0) + 1;
    level = Math.max(level, TECHNIQUE_LEVEL[step.technique]) as Level;
  }
}

export interface LogicalStep extends Placement {
  /** The technique that placed the digit. */
  technique: Technique;
  /** Techniques that ruled out candidates first, hardest last. */
  via: Technique[];
}

/** The next digit logic can place on a correct partial grid, or null when it's stuck. */
export function nextPlacement(grid: Grid): LogicalStep | null {
  const b = boardFrom(grid);
  const via = new Set<Technique>();
  for (;;) {
    const step = nextDeduction(b);
    if (!step) return null;
    if (step.placement) return { ...step.placement, technique: step.technique, via: [...via].sort((a, z) => TECHNIQUE_LEVEL[a] - TECHNIQUE_LEVEL[z]) };
    via.add(step.technique);
  }
}
