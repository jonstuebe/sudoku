import { useEffect, useRef, type CSSProperties } from 'react';
import { ROWS, bit, boxOf, colOf, rowOf } from '../lib/sudoku';
import { isLocked, isWrong, valueAt, type PuzzleRecord } from '../lib/game';
import type { Puzzle } from '../lib/types';

interface BoardProps {
  puzzle: Puzzle;
  record: PuzzleRecord;
  selected: number | null;
  onSelect: (index: number) => void;
  /** Hides the digits (and what they are) while the clock is paused. */
  hidden: boolean;
  /** A digit held on the keypad: every cell holding it lights up, in place of the selection's. */
  spotlight?: number | null;
}

const NOTE_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function describe(puzzle: Puzzle, record: PuzzleRecord, i: number): string {
  const where = `Row ${rowOf(i) + 1}, column ${colOf(i) + 1}`;
  const value = valueAt(record, i);
  if (!value) {
    const notes = NOTE_DIGITS.filter((d) => record.notes[i] & bit(d));
    return notes.length ? `${where}: empty, notes ${notes.join(' ')}` : `${where}: empty`;
  }
  const kind = puzzle.givens[i] !== '.' ? ', given' : record.hinted.includes(i) ? ', hint' : isWrong(puzzle, record, i) ? ', wrong' : '';
  return `${where}: ${value}${kind}`;
}

/** The 9×9 grid. Arrow keys move the selection (handled by Game); focus follows it. */
export function Board({ puzzle, record, selected, onSelect, hidden, spotlight = null }: BoardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const selectedValue = spotlight ?? (selected === null ? 0 : valueAt(record, selected));
  const solved = record.status === 'won';

  // Keep focus on the selected cell while it's inside the board, so arrows read out.
  useEffect(() => {
    const board = ref.current;
    if (selected === null || !board?.contains(document.activeElement)) return;
    board.querySelector<HTMLElement>(`[data-index="${selected}"]`)?.focus();
  }, [selected]);

  return (
    <div ref={ref} className={solved ? 'board is-solved' : 'board'} role="grid" aria-label="Sudoku board">
      {ROWS.map((row, r) => (
        <div key={r} role="row" className="board-row">
          {row.map((i) => {
            const value = valueAt(record, i);
            const classes = ['cell'];
            if (colOf(i) % 3 === 2 && colOf(i) < 8) classes.push('edge-right');
            if (rowOf(i) % 3 === 2 && rowOf(i) < 8) classes.push('edge-bottom');
            if (!hidden) {
              if (puzzle.givens[i] !== '.') classes.push('is-given');
              else if (record.hinted.includes(i)) classes.push('is-hinted');
              else if (value) classes.push(isWrong(puzzle, record, i) ? 'is-wrong' : 'is-entry');
              if (selected !== null) {
                if (i === selected) classes.push('is-selected');
                else if (rowOf(i) === rowOf(selected) || colOf(i) === colOf(selected) || boxOf(i) === boxOf(selected)) classes.push('is-peer');
              }
              if (selectedValue && value === selectedValue && (spotlight || i !== selected)) classes.push('is-same');
            }
            return (
              <div
                key={i}
                role="gridcell"
                data-index={i}
                className={classes.join(' ')}
                tabIndex={i === (selected ?? 0) ? 0 : -1}
                aria-selected={i === selected}
                aria-readonly={isLocked(puzzle, record, i) || undefined}
                aria-label={hidden ? `Row ${rowOf(i) + 1}, column ${colOf(i) + 1}` : describe(puzzle, record, i)}
                style={{ '--i': rowOf(i) + colOf(i) } as CSSProperties}
                onClick={() => onSelect(i)}
              >
                {hidden ? null : value ? (
                  <span className="cell-digit" aria-hidden="true">
                    {value}
                  </span>
                ) : record.notes[i] ? (
                  // Drawn by CSS, so the cell's label is the only text it reads out.
                  <span className="notes" aria-hidden="true">
                    {NOTE_DIGITS.map((d) => (
                      <span key={d} className={selectedValue === d ? 'note is-same' : 'note'} data-note={record.notes[i] & bit(d) ? d : ''} />
                    ))}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
