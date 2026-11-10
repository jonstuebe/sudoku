# Puzzles are pre-generated, graded by human techniques, and served one day at a time

Every day has four Puzzles, one per Difficulty. They're generated ahead of time by `npm run puzzles` into `worker/puzzles.json`, which lives in the Cloudflare Worker. The Worker serves `GET /api/puzzle/<YYYY-MM-DD>` only for a date that is "today" somewhere on Earth (UTC−12 to UTC+14), the same arrangement as Chain and Close Call. The response includes each solution, so play, mistake checking and Hints all work offline once the day's set is cached.

Difficulty is the hardest Technique the human-technique solver (`src/lib/techniques.ts`) needs. The generator digs holes in a random full grid, in symmetric pairs, keeping a removal only while the solver still finishes the grid at or below the target level. It keeps a Puzzle only when the result needs exactly that level. Beginner and Intermediate share level 1 (singles); Beginner's removals are instead kept only while box scanning alone solves the grid with at least three Openings at every point, so it never needs Notes. Every Technique is a sound deduction, so finishing the grid by logic proves the solution is unique. No separate uniqueness check is needed, though the unit tests run one anyway as a cross-check.

## Considered Options

- **Generate on request in the Worker:** no list to top up, but grading Expert can take hundreds of milliseconds. That's over the free plan's CPU limit, and every request would pay for it.
- **Generate in the client from a date seed:** works offline forever, but anyone could compute every future Puzzle from the bundle.
- **Grade by number of givens:** cheap, but a 26-given grid can be trivial and a 32-given one brutal. Technique level is what a player feels.
- **Hide solutions on the server and check moves there:** would cost offline play and a round-trip per digit. Today's solution reaching DevTools is accepted, as it is for Wordle.

## Consequences

- The list must be topped up: the build warns when fewer than 30 days remain, and `npm run puzzles` adds a year in about 30 seconds. Generation is seeded by date, so it's reproducible.
- The same solver gives Hints: it plays forward from the correct digits on the board and names the Technique that places the next one.
- Adding a Technique (say, chains) would change which Puzzles count as Expert. Regenerate only future days, never ones already played.
