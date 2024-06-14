export type Difficulty = "easy" | "medium" | "hard";

export type Cell = {
  value: number;
  highlighted: boolean;
  selected: boolean;
  valid: boolean;
  editable: boolean;
  notes: number[];
};
export type Board = number[][];
export type BoardWithMeta = Cell[][];
export type EmptySpot = [number, number];

export type WinningAnimation = "Hearts" | "Stars" | "Balloons";
