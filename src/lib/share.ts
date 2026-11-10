import { DIFFICULTY_LABELS, type Difficulty } from './types';
import { BOX_HINT, BOX_MISTAKE, type PuzzleRecord } from './game';
import { formatTime } from './dates';

export const GAME_URL = 'sudoku.jonstuebe.com';

export const MARKS = {
  /** A box finished clean. */
  clean: '🟩',
  /** A box where a Hint was used. */
  hint: '🟨',
  /** A box where a mistake was made. */
  mistake: '🟥',
  gaveUp: '🏳️',
};

export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/** e.g. "Perfect", or "2 mistakes, 1 hint". */
export function slipSummary(record: PuzzleRecord): string {
  const parts = [record.mistakes ? plural(record.mistakes, 'mistake') : '', record.hinted.length ? plural(record.hinted.length, 'hint') : ''].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Perfect';
}

/** The nine boxes as a spoiler-free 3×3 of squares: no digits from the grid itself. */
export function boxGrid(record: PuzzleRecord): string {
  const mark = (flags: number) => (flags & BOX_MISTAKE ? MARKS.mistake : flags & BOX_HINT ? MARKS.hint : MARKS.clean);
  return [0, 3, 6].map((row) => record.boxes.slice(row, row + 3).map(mark).join('')).join('\n');
}

export function buildShareText(puzzleNumber: number, difficulty: Difficulty, record: PuzzleRecord): string {
  const head = `Sudoku #${puzzleNumber} · ${DIFFICULTY_LABELS[difficulty]}`;
  if (record.status !== 'won') return `${head}\n${MARKS.gaveUp} Gave up\n\n${GAME_URL}`;
  return `${head}\n⏱️ ${formatTime(record.elapsedMs)} · ${slipSummary(record)}\n${boxGrid(record)}\n\n${GAME_URL}`;
}

export type ShareOutcome = 'shared' | 'copied' | 'aborted' | 'failed';

/**
 * Native share sheet where available (phones), clipboard otherwise.
 * 'failed' means the caller should show the text for manual copying.
 */
export async function shareResults(text: string, nav: Navigator = navigator): Promise<ShareOutcome> {
  if (typeof nav.share === 'function' && typeof nav.canShare === 'function' && nav.canShare({ text })) {
    try {
      await nav.share({ text });
      return 'shared';
    } catch (err) {
      if ((err as { name?: string } | null)?.name === 'AbortError') return 'aborted';
      // Otherwise fall through to the clipboard.
    }
  }
  try {
    if (!nav.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await nav.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
