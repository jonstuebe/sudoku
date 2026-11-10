import type { Settings, ThemeSetting } from '../lib/storage';
import { DifficultyPicker } from './DifficultyPicker';
import { Modal } from './Modal';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onChange: (settings: Settings) => void;
}

const THEMES: { value: ThemeSetting; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function SettingsModal({ open, onClose, settings, onChange }: SettingsModalProps) {
  return (
    <Modal title="Settings" open={open} onClose={onClose}>
      <DifficultyPicker name="settings-difficulty" legend="Difficulty" value={settings.difficulty} onChange={(difficulty) => onChange({ ...settings, difficulty })} />
      <fieldset className="setting">
        <legend className="setting-name">Theme</legend>
        <div className="segmented">
          {THEMES.map((t) => (
            <label key={t.value} className="segment">
              <input type="radio" name="theme" value={t.value} checked={settings.theme === t.value} onChange={() => onChange({ ...settings, theme: t.value })} />
              <span>{t.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="setting-footer">Sudoku v{__APP_VERSION__} · Works offline once loaded</p>
    </Modal>
  );
}
