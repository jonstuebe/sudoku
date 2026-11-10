import { Modal } from './Modal';

export function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal title="How to play" open={open} onClose={onClose}>
      <p>Fill the grid so every row, column and 3×3 box holds the digits 1 to 9 once each.</p>
      <ul className="rules">
        <li>Tap a cell, then a digit. Arrow keys and number keys work too.</li>
        <li>Turn on Notes (or hold Shift) to pencil in candidates.</li>
        <li>A wrong digit turns red and counts as a mistake. Hints reveal a cell and explain how to find it.</li>
        <li>Finish with no mistakes or hints for a perfect score.</li>
      </ul>
      <p>
        There are three new puzzles every day, the same for everyone: <strong>Beginner</strong>, <strong>Intermediate</strong> and{' '}
        <strong>Advanced</strong>. Each difficulty keeps its own streak.
      </p>
      <p className="modal-footnote">
        Beginner needs only singles. Intermediate needs pairs and locked candidates. Advanced needs X-Wings, XY-Wings and friends, but never guessing.
      </p>
      <button className="button button-primary" type="button" onClick={onClose} data-autofocus>
        Start playing
      </button>
    </Modal>
  );
}
