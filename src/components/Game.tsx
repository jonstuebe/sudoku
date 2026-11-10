import { useCallback, useEffect, useRef, useState } from 'react';
import type { Difficulty, Puzzle } from '../lib/types';
import { enterDigit, erase, giveUp, isLocked, remainingDigits, revealHint, toggleNote, undo, type HintResult, type PuzzleRecord } from '../lib/game';
import { TECHNIQUE_NAMES } from '../lib/techniques';
import { colOf, rowOf } from '../lib/sudoku';
import { formatTime } from '../lib/dates';
import { Board } from './Board';
import { Keypad } from './Keypad';
import { Result } from './Result';
import { Modal } from './Modal';
import { EraseIcon, FlagIcon, HintIcon, PauseIcon, PencilIcon, UndoIcon } from './Icons';

interface GameProps {
  puzzle: Puzzle;
  difficulty: Difficulty;
  puzzleNumber: number;
  /** Today's date as shown above the board. */
  date: string;
  record: PuzzleRecord;
  /** False while one of the app's dialogs is open; the clock stops. */
  active: boolean;
  /** Another of today's Puzzles still to play, offered once this one is done. */
  nextDifficulty: Difficulty | null;
  onDifficulty: (difficulty: Difficulty) => void;
  onRecord: (record: PuzzleRecord) => void;
  onAnnounce: (message: string) => void;
  onToast: (message: string) => void;
  onExpire: () => void;
}

/** How often the clock is saved while it runs, so a closed tab loses little. */
const SAVE_EVERY_MS = 10_000;

const article = (word: string) => (/^[aeiou]/i.test(word) || /^X/.test(word) ? 'an' : 'a');

function hintMessage({ step, index }: HintResult, digit: string): string {
  if (!step) return `Revealed a ${digit}`;
  const hardest = step.via.at(-1);
  if (hardest) return `Found with ${article(TECHNIQUE_NAMES[hardest])} ${TECHNIQUE_NAMES[hardest]}`;
  if (step.technique === 'naked-single') return `Only a ${digit} fits in row ${rowOf(index) + 1}`;
  return `Hidden single: the only spot for a ${digit}`;
}

export function Game({ puzzle, difficulty, puzzleNumber, date, record, active, nextDifficulty, onDifficulty, onRecord, onAnnounce, onToast, onExpire }: GameProps) {
  const playing = record.status === 'playing';
  const [selected, setSelected] = useState<number | null>(() => (playing ? puzzle.givens.indexOf('.') : null));
  const [notes, setNotes] = useState(false);
  const [paused, setPaused] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // The clock lives in a ref so moves can stamp it without re-rendering every tick.
  const elapsedRef = useRef(record.elapsedMs);
  const [elapsed, setElapsed] = useState(record.elapsedMs);
  const recordRef = useRef(record);
  recordRef.current = record;
  const onRecordRef = useRef(onRecord);
  onRecordRef.current = onRecord;

  const commit = useCallback((next: PuzzleRecord) => onRecordRef.current({ ...next, elapsedMs: elapsedRef.current }), []);

  const running = playing && active && !paused && !confirming;
  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    let sinceSave = 0;
    const tick = () => {
      const now = performance.now();
      elapsedRef.current += now - last;
      sinceSave += now - last;
      last = now;
      setElapsed(elapsedRef.current);
      if (sinceSave >= SAVE_EVERY_MS) {
        sinceSave = 0;
        commit(recordRef.current);
      }
    };
    const id = window.setInterval(tick, 250);
    return () => {
      window.clearInterval(id);
      tick();
      commit(recordRef.current);
    };
  }, [running, commit]);

  // Leaving the app pauses the clock, and hides the board until the player comes back.
  useEffect(() => {
    const onHide = () => document.visibilityState === 'hidden' && setPaused(true);
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);

  const canEdit = playing && !paused;

  const input = (digit: number) => {
    if (!canEdit || selected === null) return;
    if (notes) {
      if (isLocked(puzzle, record, selected) || record.cells[selected] !== '.') return onToast('Notes go in empty cells');
      return commit(toggleNote(puzzle, record, selected, digit));
    }
    const { record: next, outcome } = enterDigit(puzzle, record, selected, digit);
    if (outcome === 'locked') return;
    commit(next);
    if (outcome === 'mistake') onAnnounce(`${digit} doesn’t go there.`);
    else if (outcome === 'won') onAnnounce(`Solved in ${formatTime(elapsedRef.current)}.`);
    else if (outcome === 'erased') onAnnounce('Cleared.');
  };

  const clear = () => {
    if (canEdit && selected !== null) commit(erase(puzzle, record, selected));
  };

  const takeBack = () => {
    if (canEdit) commit(undo(record));
  };

  const hint = () => {
    if (!canEdit) return;
    const result = revealHint(puzzle, record, selected);
    if (!result) return;
    commit(result.record);
    setSelected(result.index);
    const message = hintMessage(result, puzzle.solution[result.index]);
    onToast(message);
    onAnnounce(`${message}: row ${rowOf(result.index) + 1}, column ${colOf(result.index) + 1}.`);
  };

  const surrender = () => {
    setConfirming(false);
    onAnnounce('You gave up. The solution is shown.');
    commit(giveUp(puzzle, record));
  };

  const move = (dr: number, dc: number) => {
    setSelected((s) => {
      const i = s ?? 0;
      return Math.min(8, Math.max(0, rowOf(i) + dr)) * 9 + Math.min(8, Math.max(0, colOf(i) + dc));
    });
  };

  // Physical keyboards play straight onto the board.
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => {});
  keyRef.current = (e) => {
    if (document.querySelector('dialog[open]')) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest('textarea, input:not([type="radio"])')) return;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      return takeBack();
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const arrows: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    const digit = /^(?:Digit|Numpad)([1-9])$/.exec(e.code)?.[1] ?? (/^[1-9]$/.test(e.key) ? e.key : null);
    if (arrows[e.key]) {
      // A focused difficulty tab keeps its own arrow keys.
      if (target?.closest('input')) return;
      e.preventDefault();
      move(...arrows[e.key]);
    } else if (digit) {
      e.preventDefault();
      // Shift pencils a note without switching modes.
      if (e.shiftKey && !notes && canEdit && selected !== null) commit(toggleNote(puzzle, record, selected, Number(digit)));
      else input(Number(digit));
    } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
      e.preventDefault();
      clear();
    } else if (e.key.toLowerCase() === 'n') {
      setNotes((n) => !n);
    }
  };
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => keyRef.current(e);
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <div className="meta">
        <span>
          <strong>No. {puzzleNumber}</strong>, {date}
        </span>
        <span className="meta-score">
          {record.mistakes ? (
            <>
              Mistakes <strong>{record.mistakes}</strong> ·{' '}
            </>
          ) : null}
          <time className="clock" aria-label={`Time ${formatTime(elapsed)}`}>
            {formatTime(elapsed)}
          </time>
          {playing ? (
            <button type="button" className="pause" aria-label={paused ? 'Resume' : 'Pause'} aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
              <PauseIcon />
            </button>
          ) : null}
        </span>
      </div>

      <div className="board-wrap">
        <div className="board-frame">
          <Board puzzle={puzzle} record={record} selected={playing ? selected : null} onSelect={(i) => canEdit && setSelected(i)} hidden={playing && paused} />
          {playing && paused ? (
            <div className="paused">
              <p>Paused</p>
              <button type="button" className="button button-primary" onClick={() => setPaused(false)}>
                Resume
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {playing ? (
        <section className="play" aria-label="Controls">
          <div className="tools">
            <button type="button" className="tool" disabled={!record.history.length || paused} onPointerDown={(e) => e.preventDefault()} onClick={takeBack}>
              <UndoIcon />
              Undo
            </button>
            <button type="button" className="tool" disabled={paused} onPointerDown={(e) => e.preventDefault()} onClick={clear}>
              <EraseIcon />
              Erase
            </button>
            <button type="button" className={notes ? 'tool is-on' : 'tool'} aria-pressed={notes} disabled={paused} onPointerDown={(e) => e.preventDefault()} onClick={() => setNotes((n) => !n)}>
              <PencilIcon />
              Notes
            </button>
            <button type="button" className="tool" disabled={paused} onPointerDown={(e) => e.preventDefault()} onClick={hint}>
              <HintIcon />
              Hint
            </button>
            <button type="button" className="tool" disabled={paused} onClick={() => setConfirming(true)}>
              <FlagIcon />
              Give up
            </button>
          </div>
          <Keypad remaining={remainingDigits(puzzle, record)} notes={notes} onDigit={input} />
        </section>
      ) : (
        <Result difficulty={difficulty} puzzleNumber={puzzleNumber} record={record} nextDifficulty={nextDifficulty} onDifficulty={onDifficulty} onExpire={onExpire} onToast={onToast} />
      )}

      <Modal title="Give up?" open={confirming} onClose={() => setConfirming(false)}>
        <p>You’ll see the solution, and today’s {difficulty} puzzle won’t count as solved.</p>
        <div className="modal-actions">
          <button type="button" className="button button-ghost" onClick={() => setConfirming(false)} data-autofocus>
            Keep going
          </button>
          <button type="button" className="button button-primary" onClick={surrender}>
            Give up
          </button>
        </div>
      </Modal>
    </>
  );
}
