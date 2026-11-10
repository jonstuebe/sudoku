import { PEERS, bit, boxOf, parseGrid } from './sudoku';
import { nextPlacement, type LogicalStep } from './techniques';
import type { Puzzle } from './types';

export type GameStatus = 'playing' | 'won' | 'gave-up';

/** A cell as it was before a move: index, digit (0 for empty), pencil marks. */
export type CellSnapshot = [index: number, value: number, notes: number];

/** One Puzzle as played. */
export interface PuzzleRecord {
  /** The grid as the player has it, givens included, in the same 81-character form as `Puzzle.givens`. */
  cells: string;
  /** Pencil marks per cell, as candidate masks. */
  notes: number[];
  /** Cells a Hint filled in. They lock, like givens. */
  hinted: number[];
  /** Wrong digits entered. Undo doesn't take them back. */
  mistakes: number;
  /** Per box, for the share grid: bit 1 if a mistake was made there, bit 2 if a Hint was. */
  boxes: number[];
  elapsedMs: number;
  /** Undo stack: the cells each move changed, as they were before it. */
  history: CellSnapshot[][];
  status: GameStatus;
}

export const BOX_MISTAKE = 1;
export const BOX_HINT = 2;

/** Undo reaches back this many moves. */
const HISTORY_LIMIT = 200;

export function emptyRecord(puzzle: Puzzle): PuzzleRecord {
  return { cells: puzzle.givens, notes: Array(81).fill(0), hinted: [], mistakes: 0, boxes: Array(9).fill(0), elapsedMs: 0, history: [], status: 'playing' };
}

export const valueAt = (record: PuzzleRecord, i: number) => (record.cells[i] === '.' ? 0 : Number(record.cells[i]));

/** Givens and hinted cells can't be changed. */
export function isLocked(puzzle: Puzzle, record: PuzzleRecord, i: number): boolean {
  return puzzle.givens[i] !== '.' || record.hinted.includes(i);
}

export function isWrong(puzzle: Puzzle, record: PuzzleRecord, i: number): boolean {
  return record.cells[i] !== '.' && record.cells[i] !== puzzle.solution[i];
}

/** How many of each digit (index 1–9) are still to be placed correctly. */
export function remainingDigits(puzzle: Puzzle, record: PuzzleRecord): number[] {
  const left = Array(10).fill(9);
  left[0] = 0;
  for (let i = 0; i < 81; i++) if (record.cells[i] === puzzle.solution[i]) left[Number(puzzle.solution[i])]--;
  return left;
}

/** Applies changes to cells, pushing what they were onto the undo stack. */
function apply(record: PuzzleRecord, changes: { index: number; value?: number; notes?: number }[]): PuzzleRecord {
  const cells = [...record.cells];
  const notes = record.notes.slice();
  const before: CellSnapshot[] = [];
  for (const { index, value, notes: mask } of changes) {
    before.push([index, valueAt(record, index), record.notes[index]]);
    if (value !== undefined) cells[index] = value ? String(value) : '.';
    if (mask !== undefined) notes[index] = mask;
  }
  return { ...record, cells: cells.join(''), notes, history: [...record.history, before].slice(-HISTORY_LIMIT) };
}

function finishIfSolved(puzzle: Puzzle, record: PuzzleRecord): PuzzleRecord {
  return record.cells === puzzle.solution ? { ...record, status: 'won' } : record;
}

export type EntryOutcome = 'placed' | 'mistake' | 'erased' | 'locked' | 'won';

/**
 * Puts a digit in a cell, clearing that digit from its peers' pencil marks.
 * The same digit again takes it back out.
 */
export function enterDigit(puzzle: Puzzle, record: PuzzleRecord, i: number, digit: number): { record: PuzzleRecord; outcome: EntryOutcome } {
  if (record.status !== 'playing' || isLocked(puzzle, record, i)) return { record, outcome: 'locked' };
  if (valueAt(record, i) === digit) return { record: apply(record, [{ index: i, value: 0 }]), outcome: 'erased' };

  const peers = PEERS[i].filter((p) => record.notes[p] & bit(digit)).map((p) => ({ index: p, notes: record.notes[p] & ~bit(digit) }));
  let next = apply(record, [{ index: i, value: digit, notes: 0 }, ...peers]);
  if (String(digit) !== puzzle.solution[i]) {
    const boxes = next.boxes.slice();
    boxes[boxOf(i)] |= BOX_MISTAKE;
    return { record: { ...next, mistakes: next.mistakes + 1, boxes }, outcome: 'mistake' };
  }
  next = finishIfSolved(puzzle, next);
  return { record: next, outcome: next.status === 'won' ? 'won' : 'placed' };
}

/** Pencils a digit in or out of an empty cell. */
export function toggleNote(puzzle: Puzzle, record: PuzzleRecord, i: number, digit: number): PuzzleRecord {
  if (record.status !== 'playing' || isLocked(puzzle, record, i) || valueAt(record, i)) return record;
  return apply(record, [{ index: i, notes: record.notes[i] ^ bit(digit) }]);
}

/** Clears a cell's digit, or its pencil marks when it has no digit. */
export function erase(puzzle: Puzzle, record: PuzzleRecord, i: number): PuzzleRecord {
  if (record.status !== 'playing' || isLocked(puzzle, record, i)) return record;
  if (valueAt(record, i)) return apply(record, [{ index: i, value: 0 }]);
  if (record.notes[i]) return apply(record, [{ index: i, notes: 0 }]);
  return record;
}

/** Takes back the last move. Mistakes stay counted. */
export function undo(record: PuzzleRecord): PuzzleRecord {
  const last = record.history.at(-1);
  if (record.status !== 'playing' || !last) return record;
  const cells = [...record.cells];
  const notes = record.notes.slice();
  for (const [index, value, mask] of last) {
    // A hinted cell stays revealed.
    if (record.hinted.includes(index)) continue;
    cells[index] = value ? String(value) : '.';
    notes[index] = mask;
  }
  return { ...record, cells: cells.join(''), notes, history: record.history.slice(0, -1) };
}

export interface HintResult {
  record: PuzzleRecord;
  index: number;
  /** How logic finds it, when the Hint wasn't for a cell the player picked. */
  step: LogicalStep | null;
}

/**
 * Fills in one cell with its answer. A picked cell that's empty or wrong gets
 * the Hint; otherwise it's the next cell logic can place from the correct
 * digits on the board, so the player learns how.
 */
export function revealHint(puzzle: Puzzle, record: PuzzleRecord, selected: number | null): HintResult | null {
  if (record.status !== 'playing') return null;
  let index: number;
  let step: LogicalStep | null = null;
  if (selected !== null && !isLocked(puzzle, record, selected) && record.cells[selected] !== puzzle.solution[selected]) {
    index = selected;
  } else {
    const correct = [...record.cells].map((ch, i) => (ch === puzzle.solution[i] ? ch : '.')).join('');
    step = nextPlacement(parseGrid(correct));
    // Logic got stuck (or the only gaps are wrong digits): fall back to the first unsolved cell.
    index = step && record.cells[step.index] === '.' ? step.index : [...record.cells].findIndex((ch, i) => ch !== puzzle.solution[i]);
    if (step && step.index !== index) step = null;
  }
  if (index < 0) return null;

  const digit = Number(puzzle.solution[index]);
  const peers = PEERS[index].filter((p) => record.notes[p] & bit(digit)).map((p) => ({ index: p, notes: record.notes[p] & ~bit(digit) }));
  const next = apply(record, [{ index, value: digit, notes: 0 }, ...peers]);
  const boxes = next.boxes.slice();
  boxes[boxOf(index)] |= BOX_HINT;
  // A Hint isn't a move Undo can take back.
  return { record: finishIfSolved(puzzle, { ...next, hinted: [...next.hinted, index], boxes, history: record.history }), index, step };
}

export function giveUp(puzzle: Puzzle, record: PuzzleRecord): PuzzleRecord {
  if (record.status !== 'playing') return record;
  return { ...record, cells: puzzle.solution, notes: Array(81).fill(0), history: [], status: 'gave-up' };
}
