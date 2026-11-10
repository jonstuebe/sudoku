# Sudoku

Three new sudoku every day, the same for everyone: **Beginner**, **Intermediate** and **Advanced**. Pick a difficulty (it's a saved setting, also on the tabs above the board), solve it, then share a spoiler-free result like:

```
Sudoku #12 · Advanced
⏱️ 12:34 · 1 mistake, 1 hint
🟩🟩🟩
🟩🟥🟩
🟩🟩🟨
```

- One set of three Puzzles per day, chosen from the player's **local** date.
- A small Cloudflare Worker serves only today's set, so future grids can't be read from the page source (see [ADR 0001](docs/adr/0001-pre-generated-graded-puzzles.md)).
- Wrong digits turn red and count as mistakes. Hints reveal a cell and say which technique finds it. Mistakes plus hints are **slips**; zero slips is a perfect score.
- Each difficulty keeps its own stats: played, solved %, streak, best streak, best and average time, and a slip distribution. Progress mid-puzzle, results and settings live in `localStorage` (`sudoku:v1`); today's set is cached in `sudoku:puzzle`.
- Installable PWA. It needs the network once a day to fetch the Puzzles; after that, today's games play offline.

## Develop

```sh
npm install
npm run dev          # http://localhost:5173, with the Worker API running in workerd
npm run build        # typecheck + production build into dist/client (site) and dist/sudoku (Worker)
npm run preview      # serve the build, Worker included (service worker enabled)
```

Node 26 (`mise.toml`). The first `npm install` may ask you to approve native install scripts: `npm install-scripts approve workerd esbuild`.

## Test

```sh
npm test             # Vitest: grid rules, the technique solver and grading, every shipped Puzzle,
                     # moves/undo/hints, storage and streaks, share text, puzzle fetch/cache, the Worker's date gate
npm run test:e2e     # Playwright: solving, mistakes, notes, hints, giving up, difficulties, offline, axe accessibility
```

The e2e server runs on port 4175, not Vite's default 4173, so it never reuses a sibling game's preview server.

## Deploy

```sh
npm run deploy       # build, then wrangler deploy to https://sudoku.jonstuebe.com
```

One Cloudflare Worker serves the static site and `GET /api/puzzle/<YYYY-MM-DD>`, which returns `{ number, puzzles: { beginner, intermediate, advanced } }` only while that date is "today" somewhere on Earth (UTC−12 to UTC+14). Every other date gets a 404.

## Content

Puzzles live in `worker/puzzles.json` (one day per line) and never ship in the client bundle. Top them up with:

```sh
npm run puzzles                 # generate days until the list runs a year past today
npm run puzzles -- --days 90    # ...or 90 days past today
npm run puzzles -- --dry-run    # just report what it would add
```

Generation is seeded by date, so re-running it gives the same Puzzles. Then commit and `npm run deploy`. The build warns when fewer than 30 days are left after today.

- Puzzle number = days since `LAUNCH_DATE` in `worker/puzzles.ts` (Puzzle #1 on launch day, 2026-11-10). When the list runs out, players see "Back tomorrow"; it never loops.
- Each grid is `givens` and `solution`, 81 characters row by row, `.` for an empty cell.
- Difficulty comes from `src/lib/techniques.ts`, a solver that only uses human techniques. Every Difficulty needs only singles; what changes is how easy they are to see:

  | Difficulty   | How it's solved                                                                     | Givens |
  | ------------ | ----------------------------------------------------------------------------------- | ------ |
  | Beginner     | look at a cell's row, column and box: one digit missing. Always at least 5 such cells | ≥ 44   |
  | Intermediate | scan a box for the one spot a digit fits. Always at least 3 such cells               | ≥ 40   |
  | Advanced     | hidden and naked singles anywhere; spotting them may take Notes                      | ≥ 36   |

  `fewestOpenings(grid, scan)` measures the first two: it solves by that scan alone and reports the fewest cells open at any point. The harder techniques (pairs, X-Wing, Swordfish and so on) stay in the solver so Hints can name them.

  Every Puzzle is solvable by those techniques alone (no guessing), which also proves its solution is unique. The unit tests re-check every shipped Puzzle against a brute-force solver.

## Structure

```
worker/
  index.ts           GET /api/puzzle/:date with the "today somewhere" gate
  puzzles.ts         launch date, puzzle number, date window
  puzzles.json       every day's Puzzles (server only)
src/
  lib/sudoku.ts      grid geometry, candidates, brute-force solver
  lib/techniques.ts  human-technique solver: grading and Hints
  lib/game.ts        moves: digits, notes, erase, undo, hints, give up
  lib/daily.ts       fetch today's Puzzles, cache them for offline play
  lib/dates.ts       local date key, DST-safe day maths, next midnight, times
  lib/share.ts       share text + Web Share API / clipboard fallback
  lib/storage.ts     versioned localStorage, per-difficulty streaks and stats
  lib/pwa.ts         service worker registration + update prompt
  components/        Game, Board, Keypad, Result, DifficultyPicker, modals, toasts
scripts/
  generate.ts        seeded generator: random grid, dig holes while logic still solves it
  add-puzzles.ts     npm run puzzles
  make-icons.mjs     PWA icons (npm run icons)
```
