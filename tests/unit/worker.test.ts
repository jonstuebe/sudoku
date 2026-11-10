import { describe, expect, it } from 'vitest';
import { handle } from '../../worker/index';
import { parseDateKey } from '../../worker/puzzles';
import { SET } from './fixtures';

const SECOND = { ...SET, beginner: SET.intermediate };
const SETS = [SET, SECOND];
const NOON = parseDateKey('2026-11-10')! + 12 * 3_600_000;
const get = (path: string, now = NOON, method = 'GET') => handle(new Request(`https://sudoku.jonstuebe.com${path}`, { method }), now, SETS);

describe('GET /api/puzzle/:date', () => {
  it('serves today’s three Puzzles with their number', async () => {
    const res = get('/api/puzzle/2026-11-10');
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ number: 1, puzzles: SET });
  });

  it('refuses tomorrow, so no one can read ahead', () => {
    expect(get('/api/puzzle/2026-11-12').status).toBe(404);
  });

  it('refuses a date that is over everywhere', () => {
    expect(get('/api/puzzle/2026-11-08').status).toBe(404);
  });

  it('serves tomorrow once it has begun in UTC+14', async () => {
    const res = get('/api/puzzle/2026-11-11', parseDateKey('2026-11-10')! + 11 * 3_600_000);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ number: 2 });
  });

  it('404s once the Puzzles run out', () => {
    expect(handle(new Request('https://x/api/puzzle/2026-11-10'), NOON, []).status).toBe(404);
  });

  it('400s on something that isn’t a date', () => {
    expect(get('/api/puzzle/soon').status).toBe(400);
  });

  it('405s on a write', () => {
    const res = get('/api/puzzle/2026-11-10', NOON, 'POST');
    expect(res.status).toBe(405);
    expect(res.headers.get('Allow')).toBe('GET, HEAD');
  });

  it('404s any other path', () => {
    expect(get('/api/answers').status).toBe(404);
  });

  it('lets served Puzzles be cached, but never an error', () => {
    expect(get('/api/puzzle/2026-11-10').headers.get('Cache-Control')).toContain('max-age=3600');
    expect(get('/api/puzzle/2026-11-12').headers.get('Cache-Control')).toBe('no-store');
  });
});
