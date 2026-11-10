interface KeypadProps {
  /** Digits still to place, indexed 1–9. */
  remaining: number[];
  notes: boolean;
  onDigit: (digit: number) => void;
}

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** The on-screen digits. Keys never take focus, so the board keeps its selection. */
export function Keypad({ remaining, notes, onDigit }: KeypadProps) {
  return (
    <div className={notes ? 'keypad is-notes' : 'keypad'} role="group" aria-label={notes ? 'Digits (notes)' : 'Digits'}>
      {DIGITS.map((d) => (
        <button
          key={d}
          type="button"
          className="key"
          disabled={remaining[d] === 0}
          aria-label={remaining[d] === 0 ? `${d}, all placed` : `${d}, ${remaining[d]} left`}
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => onDigit(d)}
        >
          <span className="key-digit">{d}</span>
          {/* Drawn by CSS, so the visible label stays just the digit its accessible name starts with. */}
          <span className="key-left" data-left={remaining[d] || ''} />
        </button>
      ))}
    </div>
  );
}
