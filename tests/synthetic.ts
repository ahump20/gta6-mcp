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
        runtime_recheck: 'permitted',
        permission_basis: 'SYNTHETIC permission',
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
    binding: { algorithm: 'sha256', normalization: 'collapse-unicode-whitespace-v2', scope: 'reviewed_text_only' },
    confirmations: [synClaim()],
    conflict_groups: [],
    resolutions: [],
    community_reports: [],
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

export const synConflict: Manifest['conflict_groups'][number] = {
  conflict_group_id: 'cg-syn-confirmed',
  cheat_name: 'Confirmed Cheat',
  summary: 'SYNTHETIC disagreement',
  variants: [
    { claim_id: 'syn-confirmed-ps5', input: ['Up', 'Down'], platform: 'ps5', reason: 'SYNTHETIC variant A', evidence: [] },
    { claim_id: 'syn-confirmed-ps5-b', input: ['Down', 'Up'], platform: 'ps5', reason: 'SYNTHETIC variant B', evidence: [] },
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

type Evidence = Claim['evidence'][number];
export type Report = Manifest['community_reports'][number];

export const SYN_POST_URL = 'https://www.reddit.com/r/synthetic/comments/abc123/synthetic_post/';

/** A SYNTHETIC community report about the synthetic cheat. */
export function synReport(overrides: Partial<Report> = {}): Report {
  return {
    id: 'syn-report-1',
    social_platform: 'reddit',
    url: SYN_POST_URL,
    author_handle: 'u/synthetic_author',
    posted_at: '2026-11-20T12:00:00Z',
    captured_at: SYN_REVIEWED_AT,
    evidence_type: 'text_claim',
    description: 'SYNTHETIC States a two-step sequence for the synthetic cheat on PS5.',
    min_level: 'hints',
    subject: { kind: 'cheat', cheat_name: 'Community Cheat', input: ['Left', 'Right'], platform: 'ps5', effect: null },
    video_review: null,
    review: { reviewer: review.reviewer, reviewed_at: SYN_REVIEWED_AT },
    ...overrides,
  };
}

/** SYNTHETIC frame-inspected video evidence; `n` picks one of two unrelated uploads. */
export function synVideoEvidence(n: 1 | 2, patch: Partial<Evidence> = {}, video: Partial<NonNullable<Evidence['video']>> = {}): Evidence {
  const quote = `SYNTHETIC video ${n}: frames show Up, Down entered on the phone and the effect right after.`;
  return {
    url: `https://www.youtube.com/watch?v=synthetic${n}`,
    quote,
    evidence_type: 'gameplay_video',
    own_test_covers: [],
    origin: `SYNTHETIC capture ${n}`,
    independence: 'SYNTHETIC separate capture by a different account',
    fingerprint: fingerprint(quote),
    captured_at: SYN_REVIEWED_AT,
    runtime_recheck: 'review_only',
    permission_basis: 'SYNTHETIC social platforms are outside runtime retrieval',
    video: {
      account: `@synthetic-channel-${n}`,
      posted_at: '2026-11-20T12:00:00Z',
      review_basis: 'frames',
      inspection_method: 'SYNTHETIC frame screenshots at the listed timestamps',
      console_identified: 'SYNTHETIC PS5 button glyphs in the HUD',
      continuous_footage: true,
      entry_timestamp: '0:10',
      entry_visible: 'SYNTHETIC sequence shown on the in-game phone',
      effect_timestamp: '0:14',
      effect_visible: 'SYNTHETIC effect appears',
      presses_visible: 'on_screen_sequence_only',
      ...video,
    },
    ...patch,
  };
}

export function synVideoClaim(evidence: Evidence[], overrides: Partial<Claim> = {}): Claim {
  return synClaim({ claim_id: 'syn-video-ps5', evidence, ...overrides });
}
