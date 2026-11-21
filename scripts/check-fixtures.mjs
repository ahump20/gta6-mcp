#!/usr/bin/env node
// Keeps real and synthetic material apart. Synthetic material may live only in
// tests/fixtures/synthetic (and the test helper that builds on it) and can never
// reach data/, which is production evidence.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const MARK = 'SYNTHETIC';
const root = new URL('..', import.meta.url).pathname;
const read = (...parts) => readFileSync(join(root, ...parts), 'utf8');
const list = (...parts) => readdirSync(join(root, ...parts)).filter((f) => f !== 'MANIFEST.json');
const problems = [];

const real = JSON.parse(read('tests/fixtures/real/MANIFEST.json'));
if (real.kind !== 'real') problems.push('real MANIFEST.json must have kind "real"');
for (const file of list('tests/fixtures/real')) {
  const entry = real.fixtures.find((f) => f.file === file);
  if (!entry) problems.push(`real fixture ${file} is not in MANIFEST.json`);
  else if (!entry.request_url || !entry.captured_at || !entry.license) problems.push(`real fixture ${file} needs request_url, captured_at and license`);
  if (read('tests/fixtures/real', file).includes(MARK)) problems.push(`real fixture ${file} contains synthetic material`);
}

const synthetic = JSON.parse(read('tests/fixtures/synthetic/MANIFEST.json'));
if (synthetic.kind !== 'synthetic' || synthetic.synthetic !== true) problems.push('synthetic MANIFEST.json must be marked synthetic');
for (const file of list('tests/fixtures/synthetic')) {
  if (!synthetic.fixtures.some((f) => f.file === file)) problems.push(`synthetic fixture ${file} is not in MANIFEST.json`);
  if (!read('tests/fixtures/synthetic', file).includes(MARK)) problems.push(`synthetic fixture ${file} is not labelled ${MARK}`);
}

for (const file of readdirSync(join(root, 'data'))) {
  const text = read('data', file);
  if (text.includes(MARK)) problems.push(`data/${file} contains synthetic material`);
  if (file === 'evidence.json' && JSON.parse(text).synthetic !== false) problems.push('data/evidence.json must have "synthetic": false');
}

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`fixtures ok: ${real.fixtures.length} real, ${synthetic.fixtures.length} synthetic, production data clean`);
