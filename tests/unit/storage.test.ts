import { describe, expect, it } from 'vitest';
import { STORAGE_KEY, averageMs, defaultState, distributionSlot, effectiveStreak, loadState, recordFor, recordResult, saveState, solvedPercent, type GameState } from '../../src/lib/storage';
import { emptyRecord, type PuzzleRecord } from '../../src/lib/game';
import { blockedStorage, memoryStorage, SET } from './fixtures';

const P = SET.beginner;
const won = (overrides: Partial<PuzzleRecord> = {}): PuzzleRecord => ({ ...emptyRecord(P), cells: P.solution, elapsedMs: 300_000, status: 'won', ...overrides });
const gaveUp = (): PuzzleRecord => ({ ...emptyRecord(P), cells: P.solution, status: 'gave-up' });
const stored = (state: unknown) => memoryStorage({ [STORAGE_KEY]: JSON.stringify(state) });

/** Solves Beginner `numbers` in order. */
function solveStreak(numbers: number[], state = defaultState()): GameState {
  return numbers.reduce((s, n) => recordResult(s, 'beginner', n, won()), state);
}

describe('loadState', () => {
  it('starts fresh with nothing stored', () => {
    expect(loadState(memoryStorage())).toEqual(defaultState());
  });

  it('round-trips through storage', () => {
    const storage = memoryStorage();
    const state = recordResult(defaultState(), 'advanced', 1, won({ mistakes: 2, hinted: [4] }));
    saveState(state, storage);
    expect(loadState(storage)).toEqual(state);
  });

  it.each(['{', 'null', '[]', '"nope"'])('falls back to a fresh state on junk: %s', (raw) => {
    expect(loadState(memoryStorage({ [STORAGE_KEY]: raw }))).toEqual(defaultState());
  });

  it('fills in fields a previous version never wrote', () => {
    const state = loadState(stored({ stats: { beginner: { played: 3 } }, settings: { theme: 'dark' } }));
    expect(state.stats.beginner.played).toBe(3);
    expect(state.stats.beginner.distribution).toEqual(defaultState().stats.beginner.distribution);
    expect(state.stats.advanced).toEqual(defaultState().stats.advanced);
    expect(state.settings).toEqual({ theme: 'dark', difficulty: 'beginner' });
  });

  it('drops an unknown difficulty and malformed records', () => {
    const state = loadState(stored({ settings: { difficulty: 'expert' }, results: { beginner: { 1: { cells: 'short', notes: [] }, 2: won() } } }));
    expect(state.settings.difficulty).toBe('beginner');
    expect(Object.keys(state.results.beginner)).toEqual(['2']);
  });

  it('survives blocked storage', () => {
    expect(loadState(blockedStorage())).toEqual(defaultState());
    expect(() => saveState(defaultState(), blockedStorage())).not.toThrow();
  });
});

describe('recordResult', () => {
  it('saves progress without touching stats', () => {
    const playing = { ...emptyRecord(P), mistakes: 1 };
    const state = recordResult(defaultState(), 'beginner', 1, playing);
    expect(recordFor(state, 'beginner', 1, P)).toEqual(playing);
    expect(state.stats).toEqual(defaultState().stats);
  });

  it('keeps each difficulty’s stats apart', () => {
    const state = recordResult(solveStreak([1]), 'advanced', 1, gaveUp());
    expect(state.stats.beginner).toMatchObject({ played: 1, solved: 1, currentStreak: 1 });
    expect(state.stats.advanced).toMatchObject({ played: 1, solved: 0, currentStreak: 0 });
    expect(state.stats.intermediate.played).toBe(0);
  });

  it('builds a streak on consecutive days and breaks it on a gap', () => {
    expect(solveStreak([1, 2, 3]).stats.beginner).toMatchObject({ currentStreak: 3, maxStreak: 3 });
    expect(solveStreak([1, 2, 4]).stats.beginner).toMatchObject({ currentStreak: 1, maxStreak: 2 });
  });

  it('never counts a Puzzle twice', () => {
    const once = solveStreak([1]);
    expect(recordResult(once, 'beginner', 1, won())).toBe(once);
  });

  it('tracks best and average times over solves only', () => {
    let state = recordResult(defaultState(), 'beginner', 1, won({ elapsedMs: 200_000 }));
    state = recordResult(state, 'beginner', 2, won({ elapsedMs: 400_000 }));
    state = recordResult(state, 'beginner', 3, gaveUp());
    expect(state.stats.beginner.bestMs).toBe(200_000);
    expect(averageMs(state.stats.beginner)).toBe(300_000);
    expect(solvedPercent(state.stats.beginner)).toBe(67);
  });

  it('forgets boards more than two weeks old', () => {
    const state = solveStreak([1, 2, 20]);
    expect(Object.keys(state.results.beginner)).toEqual(['20']);
  });
});

describe('distributionSlot', () => {
  it('counts mistakes and hints as slips, capped at 4+', () => {
    expect(distributionSlot(won())).toBe(0);
    expect(distributionSlot(won({ mistakes: 1, hinted: [3] }))).toBe(2);
    expect(distributionSlot(won({ mistakes: 9 }))).toBe(4);
    expect(distributionSlot(gaveUp())).toBe(5);
  });
});

describe('effectiveStreak', () => {
  it('shows a lapsed streak as 0 before the next game', () => {
    const { stats } = solveStreak([1, 2]);
    expect(effectiveStreak(stats.beginner, 3)).toBe(2);
    expect(effectiveStreak(stats.beginner, 4)).toBe(0);
  });
});
