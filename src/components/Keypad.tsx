import { useEffect, useRef, useState } from 'react';

interface KeypadProps {
  /** Digits still to place, indexed 1–9. */
  remaining: number[];
  notes: boolean;
  onDigit: (digit: number) => void;
  /** A digit held down to spotlight it on the board, or null when let go. */
  onSpotlight: (digit: number | null) => void;
}

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** How long a press lasts before it spotlights instead of entering. */
const HOLD_MS = 400;

/** The on-screen digits. Keys never take focus, so the board keeps its selection. */
export function Keypad({ remaining, notes, onDigit, onSpotlight }: KeypadProps) {
  const [held, setHeld] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);
  // Set once a hold fires, so letting go doesn't also enter the digit.
  const spotlit = useRef(false);

  const release = () => {
    window.clearTimeout(timer.current);
    if (held !== null) onSpotlight(null);
    setHeld(null);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <div className={notes ? 'keypad is-notes' : 'keypad'} role="group" aria-label={notes ? 'Digits (notes)' : 'Digits'}>
      {DIGITS.map((d) => (
        <button
          key={d}
          type="button"
          className={held === d ? 'key is-held' : 'key'}
          disabled={remaining[d] === 0}
          aria-label={remaining[d] === 0 ? `${d}, all placed` : `${d}, ${remaining[d]} left`}
          onPointerDown={(e) => {
            e.preventDefault();
            spotlit.current = false;
            window.clearTimeout(timer.current);
            // Disabled keys still get pointer events; a finished digit has nothing to find.
            if (remaining[d] === 0) return;
            timer.current = window.setTimeout(() => {
              spotlit.current = true;
              setHeld(d);
              onSpotlight(d);
            }, HOLD_MS);
          }}
          onPointerUp={release}
          onPointerLeave={release}
          onPointerCancel={release}
          onContextMenu={(e) => e.preventDefault()}
          onClick={() => {
            if (spotlit.current) spotlit.current = false;
            else onDigit(d);
          }}
        >
          <span className="key-digit">{d}</span>
          {/* Drawn by CSS, so the visible label stays just the digit its accessible name starts with. */}
          <span className="key-left" data-left={remaining[d] || ''} />
        </button>
      ))}
    </div>
  );
}
