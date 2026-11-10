import { DIFFICULTIES, DIFFICULTY_LABELS, type Difficulty } from '../lib/types';

interface DifficultyPickerProps {
  value: Difficulty;
  onChange: (difficulty: Difficulty) => void;
  /** Today's finished difficulties, ticked. */
  done?: Partial<Record<Difficulty, boolean>>;
  /** Keeps radio groups apart when more than one is on screen. */
  name: string;
  legend: string;
  className?: string;
}

export function DifficultyPicker({ value, onChange, done = {}, name, legend, className }: DifficultyPickerProps) {
  return (
    <fieldset className={`setting ${className ?? ''}`}>
      <legend className={className ? 'sr-only' : 'setting-name'}>{legend}</legend>
      <div className="segmented segmented-difficulty">
        {DIFFICULTIES.map((d) => (
          <label key={d} className="segment">
            <input type="radio" name={name} value={d} checked={value === d} onChange={() => onChange(d)} />
            <span>
              {DIFFICULTY_LABELS[d]}
              {done[d] ? (
                <>
                  <b className="segment-done" aria-hidden="true">
                    ✓
                  </b>
                  <span className="sr-only">(done)</span>
                </>
              ) : null}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
