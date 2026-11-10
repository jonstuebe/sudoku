export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

/** One graded sudoku. Both grids are 81 characters, row by row; `.` is an empty cell. */
export interface Puzzle {
  givens: string;
  /** The one and only solution. */
  solution: string;
}

/** A day's three Puzzles, as the Worker hands them to the client. */
export type PuzzleSet = Record<Difficulty, Puzzle>;
