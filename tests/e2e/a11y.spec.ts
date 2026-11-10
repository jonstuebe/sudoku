import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { closeStats, enter, openGame, pickDifficulty, stubPuzzles } from './helpers';

const scan = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();

test.beforeEach(async ({ page }) => stubPuzzles(page));

for (const theme of ['light', 'dark'] as const) {
  test(`the help dialog, the board and the finish are accessible in ${theme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/');
    expect((await scan(page)).violations).toEqual([]);

    await page.getByRole('button', { name: 'Start playing' }).click();
    // A wrong digit, a note, and the selection highlights all on screen at once.
    await pickDifficulty(page, 'Advanced');
    await enter(page, 1, 1, 1);
    await page.getByRole('button', { name: 'Notes' }).click();
    await enter(page, 1, 3, 7);
    await enter(page, 1, 3, 9);
    expect((await scan(page)).violations).toEqual([]);

    await pickDifficulty(page, 'Beginner');
    await enter(page, 1, 1, 8);
    await enter(page, 1, 2, 5);
    await enter(page, 1, 3, 2);
    await closeStats(page);
    expect((await scan(page)).violations).toEqual([]);
  });
}

test('statistics and settings are accessible', async ({ page }) => {
  await openGame(page);
  await page.getByRole('button', { name: 'Statistics' }).click();
  expect((await scan(page)).violations).toEqual([]);

  await page.getByRole('dialog', { name: 'Statistics' }).getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'Settings' }).click();
  expect((await scan(page)).violations).toEqual([]);
});

test('Enter on a focused control does that control', async ({ page }) => {
  await openGame(page);
  await enter(page, 1, 1, 8);
  await page.getByRole('button', { name: 'Undo' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('gridcell', { name: 'Row 1, column 1: empty' })).toBeVisible();
});
