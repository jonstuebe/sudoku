import { useState } from 'react';
import { DIFFICULTY_LABELS, type Difficulty } from '../lib/types';
import type { PuzzleRecord } from '../lib/game';
import { formatTime } from '../lib/dates';
import { buildShareText, shareResults, slipSummary } from '../lib/share';
import { slips } from '../lib/storage';
import { Countdown } from './Countdown';
import { ShareIcon } from './Icons';

interface ResultProps {
  difficulty: Difficulty;
  puzzleNumber: number;
  record: PuzzleRecord;
  nextDifficulty: Difficulty | null;
  onDifficulty: (difficulty: Difficulty) => void;
  onExpire: () => void;
  onToast: (message: string) => void;
}

export function Result({ difficulty, puzzleNumber, record, nextDifficulty, onDifficulty, onExpire, onToast }: ResultProps) {
  const [manual, setManual] = useState<string | null>(null);
  const won = record.status === 'won';

  const share = async () => {
    const text = buildShareText(puzzleNumber, difficulty, record);
    const outcome = await shareResults(text);
    if (outcome === 'copied') onToast('Copied results to clipboard');
    if (outcome === 'failed') {
      setManual(text);
      onToast('Copy your result below');
    }
  };

  return (
    <section className="result">
      <h2 className="result-title">{won ? (slips(record) ? 'Solved!' : 'Flawless!') : 'Solution shown'}</h2>
      <p className="result-sub">
        {won
          ? `${DIFFICULTY_LABELS[difficulty]} in ${formatTime(record.elapsedMs)}. ${slipSummary(record)}${slips(record) ? '.' : '!'}`
          : 'This one doesn’t count as solved. Tomorrow’s a fresh grid.'}
      </p>
      <div className="result-actions">
        <button className="button button-share" type="button" onClick={share}>
          Share
          <ShareIcon />
        </button>
        {nextDifficulty ? (
          <button className="button button-ghost" type="button" onClick={() => onDifficulty(nextDifficulty)}>
            Play {DIFFICULTY_LABELS[nextDifficulty]}
          </button>
        ) : null}
      </div>
      {manual ? <textarea className="manual" readOnly aria-label="Your result to copy" value={manual} onFocus={(e) => e.target.select()} /> : null}
      <Countdown onExpire={onExpire} />
    </section>
  );
}
