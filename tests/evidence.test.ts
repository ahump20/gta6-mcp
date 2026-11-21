import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  type Manifest,
  approvedEvidenceUrls,
  decideConfidence,
  fingerprint,
  loadManifest,
  manifestJsonSchema,
  validatePolicy,
} from '../src/evidence.js';
import { parseInput } from '../src/wikitext.js';
import { fixtureJson } from './helpers.js';
import { SYN_GUIDE_URL, synClaim, synConflict, synManifest, synResolution } from './synthetic.js';

const SYNTHETIC_OK = { allowSynthetic: true };
const ONE = 1;
const TWO = 2;
const firstEvidence = synClaim().evidence[0];
if (!firstEvidence) throw new Error('synthetic claim needs evidence');

function withEvidence(patch: Partial<typeof firstEvidence>, extra: (typeof firstEvidence)[] = []): Manifest {
  return synManifest({ confirmations: [synClaim({ evidence: [{ ...firstEvidence, ...patch }, ...extra] })] });
}

const candidate = { name: 'Confirmed Cheat', input: ['Up', 'Down'] as const, platform: 'ps5' as const, extractionIssue: false };

describe('fingerprint', () => {
  it('ignores whitespace differences and nothing else', () => {
    expect(fingerprint('Up,  Down\n')).toBe(fingerprint(' Up, Down'));
    expect(fingerprint('Up, Down')).not.toBe(fingerprint('Up, Left'));
    expect(fingerprint('x').startsWith('sha256:')).toBe(true);
  });
});

describe('shipped manifest', () => {
  const manifest = loadManifest();

  it('passes policy as production data', () => {
    expect(validatePolicy(manifest)).toEqual([]);
    expect(manifest.synthetic).toBe(false);
  });

  it('confirms nothing', () => {
    expect(manifest.confirmations).toEqual([]);
    expect(approvedEvidenceUrls(manifest).size).toBe(0);
  });

  it('records the Attack Force variants exactly as captured', () => {
    const excerpts = fixtureJson('real/guide-attack-force-excerpts.json') as {
      pcgamer: { row_excerpt: string };
      gamespot_archived: { row_excerpt: string };
    };
    const pcGamer = parseInput(excerpts.pcgamer.row_excerpt.split('|').at(-1) ?? '').input;
    const gameSpot = parseInput((excerpts.gamespot_archived.row_excerpt.split(':').at(-1) ?? '').replace('.', '')).input;
    const group = manifest.conflict_groups.find((g) => g.cheat_name === 'Attack Force');
    expect(pcGamer).not.toBeNull();
    expect(gameSpot).not.toBeNull();
    expect(group?.variants.map((v) => v.input)).toEqual([gameSpot, pcGamer]);
    expect(manifest.resolutions).toEqual([]);
  });

  it('matches the committed JSON Schema', () => {
    const committed = JSON.parse(readFileSync('docs/evidence.schema.json', 'utf8')) as unknown;
    expect(committed).toEqual(JSON.parse(JSON.stringify(manifestJsonSchema())));
  });
});

describe('validatePolicy', () => {
  it('accepts the synthetic manifest only when synthetic data is allowed', () => {
    expect(validatePolicy(synManifest(), SYNTHETIC_OK)).toEqual([]);
    expect(validatePolicy(synManifest()).join(' ')).toContain('synthetic');
  });

  it('rejects a wiki as confirming evidence', () => {
    const errors = validatePolicy(withEvidence({ url: 'https://gta.fandom.com/wiki/Cheats_in_GTA_VI' }), SYNTHETIC_OK);
    expect(errors.join(' ')).toContain('not an eligible evidence host');
  });

  it('rejects a research-lead host', () => {
    const errors = validatePolicy(withEvidence({ url: 'https://www.g2a.com/news/gta-6-cheats/' }), SYNTHETIC_OK);
    expect(errors.join(' ')).toContain('not an eligible evidence host');
  });

  it('rejects an eligible host that the manifest does not record', () => {
    const errors = validatePolicy(withEvidence({ url: 'https://www.eurogamer.net/all-gta-6-cheats' }), SYNTHETIC_OK);
    expect(errors.join(' ')).toContain('not recorded in approved_hosts');
  });

  it('rejects an own test that does not cover input, effect and platform', () => {
    const errors = validatePolicy(withEvidence({ own_test_covers: ['unlock_timing'] }), SYNTHETIC_OK);
    expect(errors.join(' ')).toContain('no sufficient approval basis');
  });

  it('rejects official documentation claimed from a guide host', () => {
    const errors = validatePolicy(withEvidence({ evidence_type: 'official_documentation' }), SYNTHETIC_OK);
    expect(errors.join(' ')).toContain('official_documentation needs an official host');
  });

  it('rejects two reports that share one origin', () => {
    const report = { evidence_type: 'independent_report' as const, own_test_covers: [], origin: 'SYNTHETIC same in-game list' };
    const second = { ...firstEvidence, ...report, url: 'https://www.polygon.com/synthetic-guide/' };
    expect(validatePolicy(withEvidence(report, [second]), SYNTHETIC_OK).join(' ')).toContain('no sufficient approval basis');
  });

  it('accepts two reports with different origins', () => {
    const report = { evidence_type: 'independent_report' as const, own_test_covers: [] };
    const second = { ...firstEvidence, ...report, url: 'https://www.polygon.com/synthetic-guide/', origin: 'SYNTHETIC second origin' };
    expect(validatePolicy(withEvidence(report, [second]), SYNTHETIC_OK)).toEqual([]);
  });

  it('rejects a quote whose fingerprint does not match', () => {
    const errors = validatePolicy(withEvidence({ fingerprint: fingerprint('something else') }), SYNTHETIC_OK);
    expect(errors.join(' ')).toContain('fingerprint does not match');
  });

  it('rejects a resolution backed by a single verification', () => {
    const manifest = synManifest({ conflict_groups: [synConflict], resolutions: [synResolution(ONE)] });
    expect(validatePolicy(manifest, SYNTHETIC_OK).join(' ')).toContain('two independent direct verifications');
  });

  it('accepts a resolution backed by two independent verifications', () => {
    const manifest = synManifest({ conflict_groups: [synConflict], resolutions: [synResolution(TWO)] });
    expect(validatePolicy(manifest, SYNTHETIC_OK)).toEqual([]);
  });
});

describe('decideConfidence', () => {
  it('confirms an exact match with a matching binding', () => {
    expect(decideConfidence({ ...candidate, manifest: synManifest(), binding: 'match' })).toMatchObject({
      confidence: 'confirmed',
      claim_id: 'syn-confirmed-ps5',
      conflict_group_id: null,
    });
  });

  it('lists the evidence URLs that must be re-read', () => {
    expect([...approvedEvidenceUrls(synManifest())]).toEqual([SYN_GUIDE_URL]);
  });

  it.each([
    ['a different input', { input: ['Up', 'Left'] as const }],
    ['a different platform', { platform: 'xbox-series' as const }],
    ['an unattributed platform', { platform: 'unattributed' as const }],
    ['an extraction issue', { extractionIssue: true }],
  ])('does not confirm %s', (_label, patch) => {
    expect(decideConfidence({ ...candidate, ...patch, manifest: synManifest(), binding: 'match' }).confidence).toBe('unverified');
  });

  it.each(['changed', 'unavailable', 'not_checked'] as const)('does not confirm when the binding is %s', (binding) => {
    const decision = decideConfidence({ ...candidate, manifest: synManifest(), binding });
    expect(decision.confidence).toBe('unverified');
    expect(decision.reason).not.toBe('');
  });

  it('lets an unresolved conflict override a valid approval', () => {
    const manifest = synManifest({ conflict_groups: [synConflict] });
    expect(decideConfidence({ ...candidate, manifest, binding: 'match' })).toMatchObject({
      confidence: 'conflicting',
      conflict_group_id: 'cg-syn-confirmed',
    });
  });

  it('confirms the upheld variant after a valid resolution', () => {
    const manifest = synManifest({ conflict_groups: [synConflict], resolutions: [synResolution(TWO)] });
    expect(decideConfidence({ ...candidate, manifest, binding: 'match' })).toMatchObject({
      confidence: 'confirmed',
      conflict_group_id: 'cg-syn-confirmed',
    });
  });

  it('leaves the rejected variant unverified after a resolution', () => {
    const manifest = synManifest({ conflict_groups: [synConflict], resolutions: [synResolution(TWO)] });
    const decision = decideConfidence({ ...candidate, input: ['Down', 'Up'], manifest, binding: 'match' });
    expect(decision).toMatchObject({ confidence: 'unverified', conflict_group_id: 'cg-syn-confirmed' });
    expect(decision.reason).toContain('rejected');
  });

  it('never confirms from the shipped manifest', () => {
    const attack = { name: 'Attack Force', input: ['Down', 'Up'] as const, platform: 'unattributed' as const, extractionIssue: false };
    expect(decideConfidence({ ...attack, manifest: loadManifest(), binding: 'not_checked' })).toMatchObject({
      confidence: 'conflicting',
      conflict_group_id: 'cg-attack-force',
    });
  });
});
