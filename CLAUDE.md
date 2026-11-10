# Sudoku

A daily sudoku. Every day there are three Puzzles, the same for everyone: Beginner, Intermediate and Advanced. The player's difficulty is a saved setting.

- Fill the grid so every row, column and 3×3 box holds 1–9 once each.
- A wrong digit turns red and counts as a mistake. Hints reveal a cell. Mistakes plus hints are slips; zero is perfect.
- Every Difficulty needs only singles (`src/lib/techniques.ts`), never guessing. Beginner is solved by looking at a cell's row, column and box; Intermediate by scanning boxes; both always leave several cells open, so neither needs notes.

## Agent skills

### Issue tracker

Issues live in GitHub Issues on `jonstuebe/sudoku` (via the `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` + `docs/adr/` at the repo root (created lazily). See `docs/agents/domain.md`.
