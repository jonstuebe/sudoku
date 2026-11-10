import type { Page } from '@playwright/test';

const SOLUTION = '852493176497681523163275948714852369935167284628934715541326897279548631386719452';

/**
 * Puzzles the tests control, so the suite doesn't depend on today's date.
 * Beginner has only its first three cells open: 8, 5 and 2.
 */
export const TEST_SET = {
  beginner: { givens: '...' + SOLUTION.slice(3), solution: SOLUTION },
  intermediate: { givens: '....' + SOLUTION.slice(4), solution: SOLUTION },
  advanced: {
    givens: '.3..6..5.1..5....9.95..3......3...9.2..9.1..7.4...2......7..54.7....5..8.1..9..6.',
    solution: '837469152126587439495213876671358294253941687948672315389726541764135928512894763',
  },
};

/** Serves the test Puzzles for any date, so the game is the same every run. */
export async function stubPuzzles(page: Page, number = 1, puzzles = TEST_SET): Promise<void> {
  await page.route('**/api/puzzle/*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ number, puzzles }) }));
}

/** Opens the game past the first-run help dialog. */
export async function openGame(page: Page): Promise<void> {
  await page.goto('/');
  const start = page.getByRole('button', { name: 'Start playing' });
  if (await start.isVisible()) await start.click();
  await page.getByRole('grid', { name: 'Sudoku board' }).waitFor();
}

/** The cell at a 1-based row and column. */
export function cell(page: Page, row: number, col: number) {
  return page.getByRole('gridcell', { name: new RegExp(`^Row ${row}, column ${col}:`) });
}

/** Picks a cell and types a digit on a physical keyboard. */
export async function enter(page: Page, row: number, col: number, digit: number): Promise<void> {
  await cell(page, row, col).click();
  await page.keyboard.press(String(digit));
}

/** Switches the board to a difficulty through its tab. */
export async function pickDifficulty(page: Page, name: 'Beginner' | 'Intermediate' | 'Advanced'): Promise<void> {
  // The radio itself is visually hidden; its label is what gets tapped.
  const radio = page.getByRole('radio', { name: new RegExp(`^${name}`) });
  await page.getByRole('group', { name: 'Difficulty' }).locator('label', { has: radio }).click();
}

/** Dismisses the stats dialog that slides in after the finish. */
export async function closeStats(page: Page): Promise<void> {
  const dialog = page.getByRole('dialog', { name: 'Statistics' });
  await dialog.waitFor();
  await dialog.getByRole('button', { name: 'Close' }).click();
  await dialog.waitFor({ state: 'hidden' });
}
