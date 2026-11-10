import { expect, test } from '@playwright/test';
import { cell, closeStats, enter, openGame, pickDifficulty, stubPuzzles } from './helpers';

test.beforeEach(async ({ page }) => stubPuzzles(page));

test('first visit shows how to play', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('dialog', { name: 'How to play' })).toBeVisible();
  await page.getByRole('button', { name: 'Start playing' }).click();
  await page.reload();
  await expect(page.getByRole('dialog', { name: 'How to play' })).toBeHidden();
});

test('a clean solve is flawless, and shares a spoiler-free grid', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await openGame(page);
  // The first empty cell starts selected; arrows move along the row.
  await page.keyboard.press('8');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('5');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('2');

  await expect(page.getByRole('heading', { name: 'Flawless!' })).toBeVisible();
  await closeStats(page);

  await page.getByRole('button', { name: 'Share' }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain('Sudoku #1 · Beginner');
  expect(copied).toContain('Perfect');
  expect(copied).toContain('🟩🟩🟩\n🟩🟩🟩\n🟩🟩🟩');
  expect(copied).not.toMatch(/852/);
});

test('a wrong digit shows in red, counts, and marks its box', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await openGame(page);
  await enter(page, 1, 1, 1);
  await expect(cell(page, 1, 1)).toHaveAccessibleName('Row 1, column 1: 1, wrong');
  await expect(page.getByText('Mistakes 1')).toBeVisible();

  await enter(page, 1, 1, 8);
  await enter(page, 1, 2, 5);
  await enter(page, 1, 3, 2);
  await expect(page.getByRole('heading', { name: 'Solved!' })).toBeVisible();
  await expect(page.getByText('1 mistake.')).toBeVisible();
  await closeStats(page);
  await page.getByRole('button', { name: 'Share' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('🟥🟩🟩\n🟩🟩🟩\n🟩🟩🟩');
});

test('notes pencil in candidates and clear when a digit lands nearby', async ({ page }) => {
  await openGame(page);
  await page.getByRole('button', { name: 'Notes' }).click();
  await enter(page, 1, 2, 5);
  await enter(page, 1, 2, 8);
  await expect(cell(page, 1, 2)).toHaveAccessibleName('Row 1, column 2: empty, notes 5 8');

  await page.getByRole('button', { name: 'Notes' }).click();
  await enter(page, 1, 1, 8);
  await expect(cell(page, 1, 2)).toHaveAccessibleName('Row 1, column 2: empty, notes 5');

  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(cell(page, 1, 1)).toHaveAccessibleName('Row 1, column 1: empty');
  await expect(cell(page, 1, 2)).toHaveAccessibleName('Row 1, column 2: empty, notes 5 8');
});

test('the on-screen keypad plays too, and counts what’s left', async ({ page }) => {
  await openGame(page);
  const keypad = page.getByRole('group', { name: 'Digits' });
  await cell(page, 1, 1).click();
  await keypad.getByRole('button', { name: '8, 1 left' }).click();
  await expect(keypad.getByRole('button', { name: '8, all placed' })).toBeDisabled();
});

test('a hint fills a cell and counts against the score', async ({ page }) => {
  await openGame(page);
  await cell(page, 1, 3).click();
  await page.getByRole('button', { name: 'Hint' }).click();
  await expect(cell(page, 1, 3)).toHaveAccessibleName('Row 1, column 3: 2, hint');
  await enter(page, 1, 1, 8);
  await enter(page, 1, 2, 5);
  await expect(page.getByText('Beginner in')).toContainText('1 hint');
});

test('giving up shows the solution and breaks the streak', async ({ page }) => {
  await openGame(page);
  await page.getByRole('button', { name: 'Give up' }).click();
  await page.getByRole('dialog', { name: 'Give up?' }).getByRole('button', { name: 'Give up' }).click();
  await expect(page.getByRole('heading', { name: 'Solution shown' })).toBeVisible();
  await expect(cell(page, 1, 1)).toHaveAccessibleName('Row 1, column 1: 8');
});

test('each difficulty is its own puzzle, kept separately', async ({ page }) => {
  await openGame(page);
  await enter(page, 1, 1, 8);
  await enter(page, 1, 2, 5);
  await enter(page, 1, 3, 2);
  await closeStats(page);
  await expect(page.getByRole('radio', { name: 'Beginner (done)' })).toBeChecked();

  await page.getByRole('button', { name: 'Play Intermediate' }).click();
  await expect(page.getByRole('radio', { name: 'Intermediate' })).toBeChecked();
  await expect(cell(page, 1, 4)).toHaveAccessibleName('Row 1, column 4: empty');

  // The choice is a setting, so it sticks.
  await page.reload();
  await expect(page.getByRole('radio', { name: 'Intermediate' })).toBeChecked();
  await pickDifficulty(page, 'Beginner');
  await expect(page.getByRole('heading', { name: 'Flawless!' })).toBeVisible();
});

test('progress survives a reload', async ({ page }) => {
  await openGame(page);
  await enter(page, 1, 1, 8);
  await enter(page, 1, 2, 1);
  await page.reload();
  await expect(cell(page, 1, 1)).toHaveAccessibleName('Row 1, column 1: 8');
  await expect(cell(page, 1, 2)).toHaveAccessibleName('Row 1, column 2: 1, wrong');
  await expect(page.getByText('Mistakes 1')).toBeVisible();
});

test('pausing hides the board', async ({ page }) => {
  await openGame(page);
  await page.getByRole('button', { name: 'Pause' }).click();
  await expect(page.getByText('Paused')).toBeVisible();
  await expect(page.getByRole('gridcell', { name: 'Row 1, column 4', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Resume' }).first().click();
  await expect(cell(page, 1, 4)).toHaveAccessibleName('Row 1, column 4: 4, given');
});

test('plays by touch on a phone @mobile', async ({ page }) => {
  await openGame(page);
  const keypad = page.getByRole('group', { name: 'Digits' });
  for (const [col, digit] of [
    [1, 8],
    [2, 5],
    [3, 2],
  ]) {
    await cell(page, 1, col).tap();
    await keypad.getByRole('button', { name: new RegExp(`^${digit},`) }).tap();
  }
  await expect(page.getByRole('heading', { name: 'Flawless!' })).toBeVisible();
});

test('digits go on the board right after switching difficulty', async ({ page }) => {
  await openGame(page);
  await pickDifficulty(page, 'Intermediate');
  await page.keyboard.press('8');
  await expect(cell(page, 1, 1)).toHaveAccessibleName('Row 1, column 1: 8');
});

test('holding a digit lights up every cell that has it, without entering it', async ({ page }) => {
  await openGame(page);
  const five = page.getByRole('group', { name: 'Digits' }).getByRole('button', { name: /^5,/ });
  const lit = page.locator('.cell.is-same');
  await five.hover();
  await page.mouse.down();
  // The test solution has nine 5s; one is still to place.
  await expect(lit).toHaveCount(8);
  await page.mouse.up();
  await expect(lit).toHaveCount(0);
  await expect(cell(page, 1, 1)).toHaveAccessibleName('Row 1, column 1: empty');
  await five.click();
  await expect(cell(page, 1, 1)).toHaveAccessibleName('Row 1, column 1: 5, wrong');
});

test('holding a finished digit lights up nothing', async ({ page }) => {
  await openGame(page);
  await page.getByRole('group', { name: 'Digits' }).getByRole('button', { name: /^9,/ }).hover();
  await page.mouse.down();
  await page.waitForTimeout(600);
  await expect(page.locator('.cell.is-same')).toHaveCount(0);
  await page.mouse.up();
});
