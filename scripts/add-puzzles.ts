// Tops up worker/puzzles.json so it runs a year past today.
// Usage: npm run puzzles [-- --days 365] [--dry-run]
import { readFile, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { generateSet } from './generate.ts';
import { dateOfPuzzle, parseDateKey, puzzleNumber } from '../worker/puzzles.ts';
import type { PuzzleSet } from '../src/lib/types.ts';

const file = new URL('../worker/puzzles.json', import.meta.url);
const { values } = parseArgs({ options: { days: { type: 'string', default: '365' }, 'dry-run': { type: 'boolean', default: false } } });

const sets: PuzzleSet[] = JSON.parse(await readFile(file, 'utf8').catch(() => '[]'));
const today = puzzleNumber(parseDateKey(new Date().toISOString().slice(0, 10))!);
const want = Math.max(0, today) + Number(values.days);

if (sets.length >= want) {
  console.log(`Already have ${sets.length} days, through ${dateOfPuzzle(sets.length)}.`);
} else {
  for (let n = sets.length + 1; n <= want; n++) {
    const date = dateOfPuzzle(n);
    sets.push(generateSet(date));
    if (n % 25 === 0 || n === want) console.log(`#${n} ${date}`);
  }
  if (values['dry-run']) {
    console.log(`Would write ${sets.length} days (dry run).`);
  } else {
    // One day per line keeps diffs readable.
    await writeFile(file, `[\n${sets.map((s) => JSON.stringify(s)).join(',\n')}\n]\n`);
    console.log(`Wrote ${sets.length} days, through ${dateOfPuzzle(sets.length)}.`);
  }
}
