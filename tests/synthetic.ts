// SYNTHETIC test material. Nothing in this file describes the real game.
// It exercises decision logic that the real evidence (zero confirmations) cannot reach.
import { type Claim, type Manifest, fingerprint } from '../src/evidence.js';
import { fixtureText } from './helpers.js';

export const SYN_GUIDE_URL = 'https://www.pcgamer.com/synthetic-guide/';
export const SYN_QUOTE = 'SYNTHETIC We entered Up, Down on PS5 and the effect triggered.';
export const SYN_REVIEWED_AT = '2026-11-21T00:00:00Z';
export const SYN_WIKITEXT = fixtureText('synthetic/cheats-page.wikitext');

const review = {
  reviewer: { identity: 'SYNTHETIC reviewer', type: 'ai_agent' as const },
  reviewed_at: SYN_REVIEWED_AT,
  decision: 'approved' as const,
  reason: 'SYNTHETIC approval for decision-logic tests',
};

export function synClaim(overrides: Partial<Claim> = {}): Claim {
  return {
    claim_id: 'syn-confirmed-ps5',
    game: 'Grand Theft Auto VI',
    cheat_name: 'Confirmed Cheat',
    input: ['Up', 'Down'],
    effect: 'Effect E',
    platform: 'ps5',
    input_method: 'd-pad',
    entry_steps: ['SYNTHETIC step one', 'SYNTHETIC step two'],
    game_version: null,
    evidence: [
      {
        url: SYN_GUIDE_URL,
        quote: SYN_QUOTE,
        evidence_type: 'guide_own_test',
        own_test_covers: ['input', 'effect', 'platform'],
        origin: 'SYNTHETIC PC Gamer staff test',
        independence: 'not applicable: one own test',
        fingerprint: fingerprint(SYN_QUOTE),
        captured_at: SYN_REVIEWED_AT,
      },
    ],
    review,
    ...overrides,
  };
}

export function synManifest(overrides: Partial<Manifest> = {}): Manifest {
  return {
    schema_version: 1,
    synthetic: true,
    approved_hosts: [
      { host: 'gta.fandom.com', role: 'runtime_api', purpose: 'SYNTHETIC' },
      { host: 'en.wikipedia.org', role: 'runtime_api', purpose: 'SYNTHETIC' },
      { host: 'www.pcgamer.com', role: 'guide', purpose: 'SYNTHETIC' },
      { host: 'www.polygon.com', role: 'guide', purpose: 'SYNTHETIC' },
      { host: 'www.rockstargames.com', role: 'official', purpose: 'SYNTHETIC' },
    ],
    confirmations: [synClaim()],
    conflict_groups: [],
    resolutions: [],
    spoiler_registry: {
      review: { reviewer: review.reviewer, reviewed_at: SYN_REVIEWED_AT, scope_note: 'SYNTHETIC' },
      titles: [{ provider: 'fandom', title: 'Cheats in GTA VI', min_level: 'hints' }],
      sections: [],
      cheat_rows: [],
      entry_steps: null,
      easter_eggs: [],
      easter_egg_page_titles: ['Secrets and Easter Eggs in GTA VI'],
    },
    ...overrides,
  };
}

export const synConflict = {
  conflict_group_id: 'cg-syn-confirmed',
  cheat_name: 'Confirmed Cheat',
  summary: 'SYNTHETIC disagreement',
  variants: [
    { claim_id: 'syn-confirmed-ps5', input: ['Up', 'Down'] as const, platform: 'ps5' as const, reason: 'SYNTHETIC variant A', evidence: [] },
    { claim_id: 'syn-confirmed-ps5-b', input: ['Down', 'Up'] as const, platform: 'ps5' as const, reason: 'SYNTHETIC variant B', evidence: [] },
  ],
  review: { reviewer: review.reviewer, reviewed_at: SYN_REVIEWED_AT },
};

export function synResolution(supportingCount: number): Manifest['resolutions'][number] {
  const all = [
    { url: 'https://www.pcgamer.com/synthetic-guide/', quote: 'SYNTHETIC test one', origin: 'SYNTHETIC origin one', verified_directly: true },
    { url: 'https://www.polygon.com/synthetic-guide/', quote: 'SYNTHETIC test two', origin: 'SYNTHETIC origin two', verified_directly: true },
  ];
  return {
    conflict_group_id: 'cg-syn-confirmed',
    winning_claim_id: 'syn-confirmed-ps5',
    basis: 'independent_direct_verifications',
    supporting: all.slice(0, supportingCount),
    rationale: 'SYNTHETIC resolution',
    dispositions: [
      { claim_id: 'syn-confirmed-ps5', disposition: 'upheld' },
      { claim_id: 'syn-confirmed-ps5-b', disposition: 'rejected' },
    ],
    review,
  };
}
