import { describe, expect, it } from 'vitest';
import { BOX_HINT, BOX_MISTAKE, emptyRecord, enterDigit, erase, giveUp, isLocked, remainingDigits, revealHint, toggleNote, undo } from '../../src/lib/game';
import { bit } from '../../src/lib/sudoku';
import { SET, nearlyDone } from './fixtures';

const P = SET.beginner;
// Row 1 of the beginner is ".5..93.7.", answer 852493176: cell 0 is an 8, cell 2 a 2.
const fresh = () => emptyRecord(P);

describe('enterDigit', () => {
  it('places a right digit', () => {
    const { record, outcome } = enterDigit(P, fresh(), 0, 8);
    expect(outcome).toBe('placed');
    expect(record.cells[0]).toBe('8');
    expect(record.mistakes).toBe(0);
  });

  it('counts a wrong digit as a mistake and marks its box', () => {
    const { record, outcome } = enterDigit(P, fresh(), 0, 1);
    expect(outcome).toBe('mistake');
    expect(record.cells[0]).toBe('1');
    expect(record.mistakes).toBe(1);
    expect(record.boxes[0]).toBe(BOX_MISTAKE);
  });

  it('won’t touch a given', () => {
    const record = fresh();
    expect(enterDigit(P, record, 1, 4)).toEqual({ record, outcome: 'locked' });
  });

  it('takes a digit back out when entered again', () => {
    const once = enterDigit(P, fresh(), 0, 8).record;
    const twice = enterDigit(P, once, 0, 8);
    expect(twice.outcome).toBe('erased');
    expect(twice.record.cells[0]).toBe('.');
  });

  it('clears that digit from the notes of every peer', () => {
    let record = toggleNote(P, fresh(), 2, 8); // same row
    record = toggleNote(P, record, 2, 2);
    record = toggleNote(P, record, 72, 8); // same column, far away
    record = enterDigit(P, record, 0, 8).record;
    expect(record.notes[2]).toBe(bit(2));
    expect(record.notes[72]).toBe(0);
  });

  it('wins when the last cell goes in', () => {
    const puzzle = nearlyDone(1);
    const { record, outcome } = enterDigit(puzzle, emptyRecord(puzzle), 0, 8);
    expect(outcome).toBe('won');
    expect(record.status).toBe('won');
  });
});

describe('notes, erase and undo', () => {
  it('pencils notes in and out of empty cells only', () => {
    const record = toggleNote(P, fresh(), 0, 3);
    expect(record.notes[0]).toBe(bit(3));
    expect(toggleNote(P, record, 0, 3).notes[0]).toBe(0);
    expect(toggleNote(P, record, 1, 3)).toBe(record);
  });

  it('erases a digit first, then the notes', () => {
    const record = enterDigit(P, toggleNote(P, fresh(), 0, 3), 0, 1).record;
    expect(record.notes[0]).toBe(0);
    expect(erase(P, record, 0).cells[0]).toBe('.');
    expect(erase(P, toggleNote(P, fresh(), 0, 3), 0).notes[0]).toBe(0);
  });

  it('undoes moves one at a time, notes included, but keeps mistakes', () => {
    const noted = toggleNote(P, fresh(), 2, 8);
    const wrong = enterDigit(P, noted, 0, 1).record;
    const back = undo(wrong);
    expect(back.cells[0]).toBe('.');
    expect(back.mistakes).toBe(1);
    expect(undo(back).notes[2]).toBe(0);
  });

  it('puts peer notes back when undoing a placement', () => {
    const noted = toggleNote(P, fresh(), 2, 8);
    const placed = enterDigit(P, noted, 0, 8).record;
    expect(undo(placed).notes[2]).toBe(bit(8));
  });
});

describe('revealHint', () => {
  it('fills the picked cell when it’s empty', () => {
    const hint = revealHint(P, fresh(), 0)!;
    expect(hint.index).toBe(0);
    expect(hint.step).toBeNull();
    expect(hint.record.cells[0]).toBe('8');
    expect(hint.record.boxes[0]).toBe(BOX_HINT);
    expect(isLocked(P, hint.record, 0)).toBe(true);
  });

  it('fixes the picked cell when it’s wrong', () => {
    const wrong = enterDigit(P, fresh(), 0, 1).record;
    expect(revealHint(P, wrong, 0)!.record.cells[0]).toBe('8');
  });

  it('finds the next logical cell when the pick is already right, and says how', () => {
    const hint = revealHint(P, fresh(), 1)!;
    expect(hint.step?.technique).toMatch(/single/);
    expect(hint.record.cells[hint.index]).toBe(P.solution[hint.index]);
  });

  it('survives an Undo', () => {
    const hinted = revealHint(P, enterDigit(P, fresh(), 2, 2).record, 0)!.record;
    const back = undo(hinted);
    expect(back.cells[0]).toBe('8');
    expect(back.cells[2]).toBe('.');
  });
});

describe('remainingDigits and giveUp', () => {
  it('counts digits still to place correctly', () => {
    const left = remainingDigits(P, fresh());
    expect(left.slice(1).reduce((a, b) => a + b)).toBe([...P.givens].filter((c) => c === '.').length);
    expect(remainingDigits(P, enterDigit(P, fresh(), 0, 1).record)[1]).toBe(left[1]);
  });

  it('shows the solution on giving up', () => {
    const record = giveUp(P, fresh());
    expect(record).toMatchObject({ cells: P.solution, status: 'gave-up' });
    expect(enterDigit(P, record, 0, 1).outcome).toBe('locked');
  });
});
