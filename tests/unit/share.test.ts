import { describe, expect, it, vi } from 'vitest';
import { boxGrid, buildShareText, shareResults, slipSummary } from '../../src/lib/share';
import { BOX_HINT, BOX_MISTAKE, emptyRecord, type PuzzleRecord } from '../../src/lib/game';
import { SET } from './fixtures';

const won = (overrides: Partial<PuzzleRecord> = {}): PuzzleRecord => ({ ...emptyRecord(SET.advanced), cells: SET.advanced.solution, elapsedMs: 754_000, status: 'won', ...overrides });

describe('share text', () => {
  it('shows the time, the slips and a spoiler-free box grid', () => {
    const boxes = [0, 0, 0, 0, BOX_MISTAKE | BOX_HINT, 0, 0, 0, BOX_HINT];
    expect(buildShareText(12, 'advanced', won({ mistakes: 1, hinted: [80], boxes }))).toBe(
      'Sudoku #12 · Advanced\n⏱️ 12:34 · 1 mistake, 1 hint\n🟩🟩🟩\n🟩🟥🟩\n🟩🟩🟨\n\nsudoku.jonstuebe.com',
    );
  });

  it('calls a clean solve Perfect', () => {
    expect(slipSummary(won())).toBe('Perfect');
    expect(boxGrid(won())).toBe('🟩🟩🟩\n🟩🟩🟩\n🟩🟩🟩');
  });

  it('pluralises', () => {
    expect(slipSummary(won({ mistakes: 2, hinted: [1, 2, 3] }))).toBe('2 mistakes, 3 hints');
  });

  it('gives no grid for a give-up', () => {
    expect(buildShareText(3, 'beginner', { ...won(), status: 'gave-up' })).toBe('Sudoku #3 · Beginner\n🏳️ Gave up\n\nsudoku.jonstuebe.com');
  });
});

describe('shareResults', () => {
  const nav = (overrides: Partial<Navigator>) => overrides as Navigator;

  it('uses the share sheet where there is one', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    await expect(shareResults('hi', nav({ share, canShare: () => true }))).resolves.toBe('shared');
  });

  it('respects a cancelled share sheet', async () => {
    const share = vi.fn().mockRejectedValue(Object.assign(new Error(), { name: 'AbortError' }));
    await expect(shareResults('hi', nav({ share, canShare: () => true }))).resolves.toBe('aborted');
  });

  it('falls back to the clipboard, then to manual copying', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    await expect(shareResults('hi', nav({ clipboard: { writeText } as unknown as Clipboard }))).resolves.toBe('copied');
    await expect(shareResults('hi', nav({}))).resolves.toBe('failed');
  });
});
