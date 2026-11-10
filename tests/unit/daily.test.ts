import { describe, expect, it, vi } from 'vitest';
import { PUZZLE_CACHE_KEY, cachedDaily, estimatedPuzzleNumber, loadDaily, readCachedPuzzles } from '../../src/lib/daily';
import { SET, blockedStorage, memoryStorage } from './fixtures';

const DAILY = { date: '2026-11-10', number: 1, puzzles: SET };
const cached = (value: unknown) => memoryStorage({ [PUZZLE_CACHE_KEY]: JSON.stringify(value) });

const respond = (body: unknown, status = 200) => vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));

describe('loadDaily', () => {
  it('fetches the Puzzles for the date and caches them', async () => {
    const storage = memoryStorage();
    const fetcher = respond({ number: 1, puzzles: SET });
    await expect(loadDaily('2026-11-10', fetcher, storage)).resolves.toEqual({ status: 'ready', ...DAILY });
    expect(fetcher).toHaveBeenCalledWith('/api/puzzle/2026-11-10');
    expect(readCachedPuzzles(storage)).toEqual(DAILY);
  });

  it('serves the cache without a request, so a reload mid-game is free', async () => {
    const fetcher = vi.fn();
    await expect(loadDaily('2026-11-10', fetcher, cached(DAILY))).resolves.toEqual({ status: 'ready', ...DAILY });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('ignores a cache from another day', async () => {
    const fetcher = respond({ number: 2, puzzles: SET });
    await expect(loadDaily('2026-11-11', fetcher, cached(DAILY))).resolves.toMatchObject({ status: 'ready', number: 2 });
  });

  it('reports "none" on a 404: before launch, or the list ran out', async () => {
    await expect(loadDaily('2030-01-01', respond({}, 404), memoryStorage())).resolves.toEqual({ status: 'none' });
  });

  it('reports "offline" when the request throws or the server errors', async () => {
    await expect(loadDaily('2026-11-10', vi.fn().mockRejectedValue(new Error('offline')), memoryStorage())).resolves.toEqual({ status: 'offline' });
    await expect(loadDaily('2026-11-10', respond({}, 500), memoryStorage())).resolves.toEqual({ status: 'offline' });
  });

  it('refuses a malformed body rather than caching it', async () => {
    const storage = memoryStorage();
    await expect(loadDaily('2026-11-10', respond({ number: 1, puzzles: { beginner: SET.beginner } }), storage)).resolves.toEqual({ status: 'offline' });
    expect(readCachedPuzzles(storage)).toBeNull();
  });

  it('stays playable when storage is blocked', async () => {
    await expect(loadDaily('2026-11-10', respond({ number: 1, puzzles: SET }), blockedStorage())).resolves.toMatchObject({ status: 'ready' });
  });
});

describe('cachedDaily', () => {
  it('only answers for the date it holds', () => {
    expect(cachedDaily('2026-11-10', cached(DAILY))).toMatchObject({ status: 'ready' });
    expect(cachedDaily('2026-11-11', cached(DAILY))).toBeNull();
    expect(cachedDaily('2026-11-10', memoryStorage({ [PUZZLE_CACHE_KEY]: 'junk' }))).toBeNull();
  });
});

describe('estimatedPuzzleNumber', () => {
  it('counts on from the last Puzzles seen, so stats work offline', () => {
    expect(estimatedPuzzleNumber('2026-11-13', cached(DAILY))).toBe(4);
    expect(estimatedPuzzleNumber('2026-11-13', memoryStorage())).toBeNull();
  });
});
