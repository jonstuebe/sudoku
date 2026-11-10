import { DIFFICULTIES, type Difficulty, type Puzzle } from './types';
import { emptyRecord, type PuzzleRecord } from './game';

export const STORAGE_KEY = 'sudoku:v1';

export type ThemeSetting = 'system' | 'light' | 'dark';

/** Kept per difficulty: each has its own streak. */
export interface Stats {
  played: number;
  solved: number;
  currentStreak: number;
  maxStreak: number;
  /** Solves with 0, 1, 2, 3 and 4+ slips (mistakes plus hints) at indexes 0..4; give-ups at 5. */
  distribution: number[];
  /** The last Puzzle number played to a finish, for streak continuity. */
  lastPuzzle: number | null;
  lastSolved: boolean;
  bestMs: number | null;
  /** Summed over solves, for the average. */
  totalMs: number;
}

export interface Settings {
  theme: ThemeSetting;
  /** Which of the day's four Puzzles is on the board. */
  difficulty: Difficulty;
}

export interface GameState {
  results: Record<Difficulty, Record<number, PuzzleRecord>>;
  stats: Record<Difficulty, Stats>;
  settings: Settings;
  seenHelp: boolean;
}

export const DISTRIBUTION_LABELS = ['Perfect', '1', '2', '3', '4+', 'Gave up'];
const GAVE_UP_SLOT = DISTRIBUTION_LABELS.length - 1;

/** Finished Puzzles older than this many days are dropped, to keep storage small. */
const KEEP_DAYS = 14;

const perDifficulty = <T>(make: () => T) => Object.fromEntries(DIFFICULTIES.map((d) => [d, make()])) as Record<Difficulty, T>;

export function emptyStats(): Stats {
  return { played: 0, solved: 0, currentStreak: 0, maxStreak: 0, distribution: Array(DISTRIBUTION_LABELS.length).fill(0), lastPuzzle: null, lastSolved: false, bestMs: null, totalMs: 0 };
}

export function defaultState(): GameState {
  return {
    results: perDifficulty(() => ({})),
    stats: perDifficulty(emptyStats),
    settings: { theme: 'system', difficulty: 'beginner' },
    seenHelp: false,
  };
}

/** Reads state, tolerating missing, corrupt, or partial data and blocked storage. */
export function loadState(storage: Storage | undefined = safeStorage()): GameState {
  const base = defaultState();
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    if (!parsed || typeof parsed !== 'object') return base;
    const settings = { ...base.settings, ...parsed.settings };
    if (!DIFFICULTIES.includes(settings.difficulty)) settings.difficulty = base.settings.difficulty;
    return {
      results: Object.fromEntries(DIFFICULTIES.map((d) => [d, sanitizeResults(parsed.results?.[d])])) as GameState['results'],
      stats: Object.fromEntries(DIFFICULTIES.map((d) => [d, sanitizeStats(parsed.stats?.[d])])) as GameState['stats'],
      settings,
      seenHelp: parsed.seenHelp === true,
    };
  } catch {
    return base;
  }
}

function sanitizeStats(stats: Partial<Stats> | undefined): Stats {
  const base = emptyStats();
  if (!stats || typeof stats !== 'object') return base;
  const distribution = Array.isArray(stats.distribution) && stats.distribution.length === DISTRIBUTION_LABELS.length ? stats.distribution.map((n) => Number(n) || 0) : base.distribution;
  return { ...base, ...stats, distribution };
}

const isMaskList = (value: unknown, length: number) => Array.isArray(value) && value.length === length && value.every((n) => Number.isInteger(n));

function sanitizeResults(results: unknown): Record<number, PuzzleRecord> {
  if (!results || typeof results !== 'object') return {};
  const out: Record<number, PuzzleRecord> = {};
  for (const [key, value] of Object.entries(results as Record<string, unknown>)) {
    const number = Number(key);
    const r = value as Partial<PuzzleRecord> | null;
    if (!Number.isInteger(number) || !r || typeof r.cells !== 'string' || !/^[1-9.]{81}$/.test(r.cells) || !isMaskList(r.notes, 81)) continue;
    out[number] = {
      cells: r.cells,
      notes: r.notes!,
      hinted: Array.isArray(r.hinted) ? r.hinted.filter((i) => Number.isInteger(i)) : [],
      mistakes: Number(r.mistakes) || 0,
      boxes: isMaskList(r.boxes, 9) ? r.boxes! : Array(9).fill(0),
      elapsedMs: Number(r.elapsedMs) || 0,
      history: Array.isArray(r.history) ? r.history : [],
      status: r.status === 'won' || r.status === 'gave-up' ? r.status : 'playing',
    };
  }
  return out;
}

export function saveState(state: GameState, storage: Storage | undefined = safeStorage()): void {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or quota exceeded: the game still works for this session.
  }
}

/** The Puzzle as the player left it, or a fresh one. */
export function recordFor(state: GameState, difficulty: Difficulty, number: number, puzzle: Puzzle): PuzzleRecord {
  return state.results[difficulty][number] ?? emptyRecord(puzzle);
}

/** Slips are mistakes plus hints. */
export function slips(record: PuzzleRecord): number {
  return record.mistakes + record.hinted.length;
}

/** The distribution row a finished Puzzle lands in. */
export function distributionSlot(record: PuzzleRecord): number {
  if (record.status !== 'won') return GAVE_UP_SLOT;
  return Math.min(GAVE_UP_SLOT - 1, slips(record));
}

/**
 * Saves a move, and on a finish records the stats. Once a Puzzle has a
 * finished record nothing changes it, so it can never be counted twice.
 */
export function recordResult(state: GameState, difficulty: Difficulty, puzzle: number, record: PuzzleRecord): GameState {
  const existing = state.results[difficulty][puzzle];
  if (existing && existing.status !== 'playing') return state;
  const kept = Object.fromEntries(Object.entries(state.results[difficulty]).filter(([n]) => Number(n) > puzzle - KEEP_DAYS));
  const results = { ...state.results, [difficulty]: { ...kept, [puzzle]: record } };
  if (record.status === 'playing') return { ...state, results };

  const prev = state.stats[difficulty];
  const solved = record.status === 'won';
  const distribution = prev.distribution.slice();
  const slot = distributionSlot(record);
  distribution[slot] = (distribution[slot] ?? 0) + 1;
  const continues = prev.lastPuzzle === puzzle - 1 && prev.lastSolved;
  const currentStreak = solved ? (continues ? prev.currentStreak + 1 : 1) : 0;

  return {
    ...state,
    results,
    stats: {
      ...state.stats,
      [difficulty]: {
        played: prev.played + 1,
        solved: prev.solved + (solved ? 1 : 0),
        currentStreak,
        maxStreak: Math.max(prev.maxStreak, currentStreak),
        distribution,
        lastPuzzle: puzzle,
        lastSolved: solved,
        bestMs: solved && (prev.bestMs === null || record.elapsedMs < prev.bestMs) ? record.elapsedMs : prev.bestMs,
        totalMs: prev.totalMs + (solved ? record.elapsedMs : 0),
      },
    },
  };
}

/** The streak as of today: a missed day shows as 0 even before the next game. */
export function effectiveStreak(stats: Stats, today: number): number {
  if (stats.lastPuzzle === null) return 0;
  return today - stats.lastPuzzle <= 1 ? stats.currentStreak : 0;
}

export function solvedPercent(stats: Stats): number {
  return stats.played ? Math.round((stats.solved / stats.played) * 100) : 0;
}

export function averageMs(stats: Stats): number | null {
  return stats.solved ? Math.round(stats.totalMs / stats.solved) : null;
}

function safeStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}
