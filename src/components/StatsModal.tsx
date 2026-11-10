import { useEffect, useState } from 'react';
import { DISTRIBUTION_LABELS, averageMs, effectiveStreak, solvedPercent, type Stats } from '../lib/storage';
import type { Difficulty } from '../lib/types';
import { formatTime } from '../lib/dates';
import { DifficultyPicker } from './DifficultyPicker';
import { Modal } from './Modal';

interface StatsModalProps {
  open: boolean;
  onClose: () => void;
  stats: Record<Difficulty, Stats>;
  /** The difficulty on the board, shown first. */
  difficulty: Difficulty;
  /** Today's Puzzle number, for a streak that's already lapsed. */
  today: number | null;
  /** Today's distribution row for the difficulty on the board once finished, null mid-game. */
  highlight: number | null;
}

export function StatsModal({ open, onClose, stats: all, difficulty, today, highlight }: StatsModalProps) {
  const [shown, setShown] = useState(difficulty);
  useEffect(() => {
    if (open) setShown(difficulty);
  }, [open, difficulty]);

  const stats = all[shown];
  const streak = today === null ? stats.currentStreak : effectiveStreak(stats, today);
  const average = averageMs(stats);
  const summary = [
    { value: stats.played, label: 'Played' },
    { value: solvedPercent(stats), label: 'Solved %' },
    { value: streak, label: 'Streak' },
    { value: stats.maxStreak, label: 'Best streak' },
  ];
  const peak = Math.max(1, ...stats.distribution);
  const mine = shown === difficulty ? highlight : null;

  return (
    <Modal title="Statistics" open={open} onClose={onClose}>
      <DifficultyPicker name="stats-difficulty" legend="Statistics for" value={shown} onChange={setShown} className="stats-picker" />
      <div className="stats-grid">
        {summary.map((item) => (
          <div key={item.label}>
            <b>{item.value}</b>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <div className="stats-times">
        <div>
          <span>Best time</span>
          <b>{stats.bestMs === null ? '–' : formatTime(stats.bestMs)}</b>
        </div>
        <div>
          <span>Average</span>
          <b>{average === null ? '–' : formatTime(average)}</b>
        </div>
      </div>
      <h3 className="dist-title">Mistakes and hints</h3>
      <div className="dist">
        {stats.distribution.map((count, i) => (
          <div key={i} className="dist-row">
            <span className="dist-label">{DISTRIBUTION_LABELS[i]}</span>
            <i className={i === mine ? 'dist-bar is-mine' : 'dist-bar'} style={{ width: `${Math.max(8, (count / peak) * 100)}%` }}>
              {count}
            </i>
          </div>
        ))}
      </div>
      {stats.played === 0 ? <p className="modal-footnote">Finish your first puzzle at this difficulty to start a streak.</p> : null}
    </Modal>
  );
}
