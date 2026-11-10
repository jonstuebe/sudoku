# Sudoku

A daily sudoku: every player gets the same three grids each day, one per difficulty.

## Language

**Puzzle**:
One graded grid: its givens and its single solution.
_Avoid_: Board, level, game

**Puzzle set**:
A day's three Puzzles, one per Difficulty, served together.
_Avoid_: Daily, bundle

**Puzzle number**:
The position of a day counted from the Launch date, where the Launch date's set is #1. All three Difficulties share it.
_Avoid_: Day number, puzzle id

**Launch date**:
The local calendar date on which Puzzle #1 is played.

**Difficulty**:
Beginner, Intermediate or Advanced. All three need only singles; they differ in how easily the next cell is seen. Beginner is solved by Looking, with at least five Openings at every point. Intermediate is solved by Box scanning, with at least three. Advanced may need Notes. The player's choice is a setting.
_Avoid_: Mode, tier

**Technique**:
A deduction a person makes, from hidden singles up to Swordfish. Each has a level (1–3). Every Difficulty needs only level 1; the rest let Hints explain a grid a player has got stuck on.

**Looking**:
Finding a cell's digit by checking its row, column and box: when they show eight different digits, the ninth goes here. Beginner's Scan.
_Avoid_: Naked single (that's the solver's word, with Notes)

**Box scanning**:
Finding where a digit goes by checking which cells of a box it's ruled out of. Intermediate's Scan.
_Avoid_: Cross-hatching

**Opening**:
A cell a player could fill right now by a Scan (Looking or Box scanning), without Notes.

**Givens**:
The digits a Puzzle starts with. They can't be changed.
_Avoid_: Clues, hints

**Notes**:
Pencil marks: candidate digits the player jots in an empty cell.
_Avoid_: Candidates (that's the solver's word), pencil

**Mistake**:
A wrong digit entered in a cell. Counted at once and never refunded, even by Undo.

**Hint**:
A cell filled in with its answer. When the player hasn't picked an empty or wrong cell, it's the next cell logic can place, named by Technique. Hinted cells lock like Givens.

**Slips**:
Mistakes plus Hints. Zero slips is a perfect solve.

**Box grid**:
The 3×3 of squares in the share text: green for a box finished clean, yellow where a Hint was used, red where a Mistake was made.
