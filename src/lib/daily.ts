import { DIFFICULTIES, type PuzzleSet } from './types';
import { daysBetween } from './dates';

export const PUZZLE_CACHE_KEY = 'sudoku:puzzle';

export interface DailyPuzzles {
  date: string;
  number: number;
  puzzles: PuzzleSet;
}

export type Daily =
  | { status: 'loading' }
  | ({ status: 'ready' } & DailyPuzzles)
  /** The server has no Puzzles for this date: before launch, or the list ran out. */
  | { status: 'none' }
  /** Couldn't reach the server and nothing is cached for this date. */
  | { status: 'offline' };

const GRID = /^[1-9.]{81}$/;

function isPuzzleSet(value: unknown): value is PuzzleSet {
  const set = value as Partial<PuzzleSet> | null;
  return !!set && DIFFICULTIES.every((d) => GRID.test(set[d]?.givens ?? '') && /^[1-9]{81}$/.test(set[d]?.solution ?? ''));
}

/** The cached Puzzles, whatever date they were for. */
export function readCachedPuzzles(storage: Storage | undefined = safeStorage()): DailyPuzzles | null {
  try {
    const raw = storage?.getItem(PUZZLE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DailyPuzzles;
    const valid = typeof parsed?.date === 'string' && typeof parsed.number === 'number' && isPuzzleSet(parsed.puzzles);
    return valid ? parsed : null;
  } catch {
    return null;
  }
}

/** Today's Puzzles from the cache, so a game started online keeps working offline. */
export function cachedDaily(date: string, storage?: Storage): Daily | null {
  const cached = readCachedPuzzles(storage);
  return cached?.date === date ? { status: 'ready', ...cached } : null;
}

/** Fetches the Puzzles for a local date, falling back to the cache when offline. */
export async function loadDaily(date: string, fetcher: typeof fetch = fetch, storage: Storage | undefined = safeStorage()): Promise<Daily> {
  const cached = cachedDaily(date, storage);
  if (cached) return cached;
  let res: Response;
  try {
    res = await fetcher(`/api/puzzle/${date}`);
  } catch {
    return { status: 'offline' };
  }
  if (res.status === 404) return { status: 'none' };
  if (!res.ok) return { status: 'offline' };
  try {
    const body = (await res.json()) as { number: number; puzzles: PuzzleSet };
    if (!isPuzzleSet(body.puzzles)) return { status: 'offline' };
    const daily: DailyPuzzles = { date, number: body.number, puzzles: body.puzzles };
    try {
      storage?.setItem(PUZZLE_CACHE_KEY, JSON.stringify(daily));
    } catch {
      // Blocked storage: playable now, just not offline later.
    }
    return { status: 'ready', ...daily };
  } catch {
    return { status: 'offline' };
  }
}

/**
 * Today's Puzzle number when the Puzzles themselves aren't available, counted
 * on from the last ones seen. Lets stats show a broken streak while offline.
 */
export function estimatedPuzzleNumber(date: string, storage?: Storage): number | null {
  const cached = readCachedPuzzles(storage);
  return cached ? cached.number + daysBetween(cached.date, date) : null;
}

function safeStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}
