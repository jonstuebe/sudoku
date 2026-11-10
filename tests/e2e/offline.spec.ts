import { expect, test } from '@playwright/test';
import { TEST_SET, cell, enter, openGame, stubPuzzles } from './helpers';

test('says so when there is no connection and nothing cached', async ({ page }) => {
  await page.route('**/api/puzzle/*', (route) => route.abort());
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'No connection' })).toBeVisible();
});

test('recovers when the network comes back', async ({ page }) => {
  let online = false;
  await page.route('**/api/puzzle/*', (route) =>
    online ? route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ number: 1, puzzles: TEST_SET }) }) : route.abort(),
  );

  await page.goto('/');
  await page.getByRole('button', { name: 'Start playing' }).click();
  await expect(page.getByRole('heading', { name: 'No connection' })).toBeVisible();
  online = true;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('grid', { name: 'Sudoku board' })).toBeVisible();
});

test('a game started online keeps playing offline', async ({ page }) => {
  await stubPuzzles(page);
  await openGame(page);
  await enter(page, 1, 1, 8);

  // The Puzzles are cached; nothing may reach the network from here on.
  await page.unroute('**/api/puzzle/*');
  await page.route('**/api/puzzle/*', (route) => route.abort());
  await page.reload();

  await expect(cell(page, 1, 1)).toHaveAccessibleName('Row 1, column 1: 8');
  await enter(page, 1, 2, 5);
  await enter(page, 1, 3, 2);
  await expect(page.getByRole('heading', { name: 'Flawless!' })).toBeVisible();
});

test('says "back tomorrow" when there are no Puzzles for today', async ({ page }) => {
  await page.route('**/api/puzzle/*', (route) => route.fulfill({ status: 404, contentType: 'application/json', body: '{}' }));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Back tomorrow' })).toBeVisible();
});
