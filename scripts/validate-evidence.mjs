#!/usr/bin/env node
// Validates data/evidence.json: structure, policy, and that the committed JSON
// Schema matches the code. Run `npm run build` first. `--write-schema` regenerates the schema file.
import { readFileSync, writeFileSync } from 'node:fs';
import { loadManifest, manifestJsonSchema, validatePolicy } from '../dist/evidence.js';

const schemaPath = new URL('../docs/evidence.schema.json', import.meta.url);
const generated = `${JSON.stringify(manifestJsonSchema(), null, 2)}\n`;
if (process.argv.includes('--write-schema')) writeFileSync(schemaPath, generated);

const problems = [];
let manifest;
try {
  manifest = loadManifest();
} catch (error) {
  problems.push(`structure: ${error.message}`);
}
if (manifest) problems.push(...validatePolicy(manifest).map((p) => `policy: ${p}`));
if (readFileSync(schemaPath, 'utf8') !== generated) problems.push('docs/evidence.schema.json is out of date; run with --write-schema');

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(
  `evidence ok: ${manifest.confirmations.length} confirmation(s), ${manifest.conflict_groups.length} conflict group(s), ` +
    `${manifest.resolutions.length} resolution(s), ${manifest.spoiler_registry.cheat_rows.length} reviewed cheat row(s), synthetic=${manifest.synthetic}`,
);
