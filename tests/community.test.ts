// Community registry and gameplay-video rule. All fixtures are SYNTHETIC (tests/synthetic.ts).
import { describe, expect, it } from 'vitest';
import { ManifestSchema, approvedEvidenceUrls, decideConfidence, loadManifest, validatePolicy } from '../src/evidence.js';
import { SYN_GUIDE_URL, SYN_POST_URL, synClaim, synConflict, synManifest, synReport, synVideoClaim, synVideoEvidence } from './synthetic.js';

const SYNTHETIC_OK = { allowSynthetic: true };
const candidate = { name: 'Confirmed Cheat', input: ['Up', 'Down'] as const, platform: 'ps5' as const, extractionIssue: false };
const policy = (confirmations: ReturnType<typeof synClaim>[], extra = {}) =>
  validatePolicy(synManifest({ confirmations, ...extra }), SYNTHETIC_OK);
const [guideEvidence] = synClaim().evidence;

describe('community registry', () => {
  it('accepts an empty registry and a reviewed entry', () => {
    expect(validatePolicy(synManifest(), SYNTHETIC_OK)).toEqual([]);
    expect(validatePolicy(synManifest({ community_reports: [synReport()] }), SYNTHETIC_OK)).toEqual([]);
  });

  it('rejects post text smuggled into an entry', () => {
    const smuggled = { ...synManifest(), community_reports: [{ ...synReport(), text: 'copied post body' }] };
    expect(ManifestSchema.safeParse(smuggled).success).toBe(false);
  });

  it('requires an absolute post time on or after launch day', () => {
    const { posted_at: _dropped, ...noTime } = synReport();
    expect(ManifestSchema.safeParse({ ...synManifest(), community_reports: [noTime] }).success).toBe(false);
    const early = synManifest({ community_reports: [synReport({ posted_at: '2026-11-18T23:59:59Z' })] });
    expect(validatePolicy(early, SYNTHETIC_OK).join(' ')).toContain('before 2026-11-19');
  });

  it('rejects a community report used as an approval', () => {
    const cited = synClaim({ evidence: [{ ...guideEvidence!, url: SYN_POST_URL }] });
    const errors = policy([cited], { community_reports: [synReport()] });
    expect(errors.join(' ')).toContain('community report');
  });

  it('rejects a social host carrying anything but frame-inspected video', () => {
    const errors = policy([synClaim({ evidence: [{ ...guideEvidence!, url: SYN_POST_URL, evidence_type: 'independent_report' }] })]);
    expect(errors.join(' ')).toContain('social host');
  });
});

describe('video rule', () => {
  it('leaves a claim with one inspected video without an approval basis', () => {
    expect(policy([synVideoClaim([synVideoEvidence(1)])]).join(' ')).toContain('no sufficient approval basis');
  });

  it('accepts two inspected videos from different accounts and captures', () => {
    expect(policy([synVideoClaim([synVideoEvidence(1), synVideoEvidence(2)])])).toEqual([]);
  });

  it('counts a reupload or clip as the same origin', () => {
    const reupload = synVideoEvidence(2, { origin: synVideoEvidence(1).origin });
    expect(policy([synVideoClaim([synVideoEvidence(1), reupload])]).join(' ')).toContain('no sufficient approval basis');
  });

  it('does not count two uploads by one account twice', () => {
    const sameAccount = synVideoEvidence(2, {}, { account: '@synthetic-channel-1' });
    expect(policy([synVideoClaim([synVideoEvidence(1), sameAccount])]).join(' ')).toContain('no sufficient approval basis');
  });

  it.each(['transcript', 'title', 'thumbnail', 'description', 'caption'] as const)('rejects a %s-only review', (basis) => {
    const weak = synVideoEvidence(2, {}, { review_basis: basis });
    expect(policy([synVideoClaim([synVideoEvidence(1), weak])]).join(' ')).toContain('frames');
  });

  it('rejects footage that is not continuous', () => {
    const cut = synVideoEvidence(2, {}, { continuous_footage: false });
    expect(policy([synVideoClaim([synVideoEvidence(1), cut])]).join(' ')).toContain('continuous');
  });

  it('makes disagreeing approved videos open a conflict', () => {
    const a = synVideoClaim([synVideoEvidence(1), synVideoEvidence(2)]);
    const b = synVideoClaim([synVideoEvidence(1), synVideoEvidence(2)], { claim_id: 'syn-video-ps5-b', input: ['Down', 'Up'] });
    expect(policy([a, b]).join(' ')).toContain('conflict group');
    const recorded = synManifest({ confirmations: [a, b], conflict_groups: [synConflict] });
    expect(validatePolicy(recorded, SYNTHETIC_OK).join(' ')).not.toContain('conflict group');
    expect(decideConfidence({ ...candidate, manifest: recorded, binding: 'review_only' }).confidence).toBe('conflicting');
  });
});

describe('decisions with review-only and unpermitted evidence', () => {
  const videoManifest = synManifest({ confirmations: [synVideoClaim([synVideoEvidence(1), synVideoEvidence(2)])] });

  it('confirms a video-backed approval as reviewed, without a re-read', () => {
    expect(decideConfidence({ ...candidate, manifest: videoManifest, binding: 'review_only' }).confidence).toBe('confirmed');
  });

  it('does not let review_only confirm evidence that can be re-read', () => {
    expect(decideConfidence({ ...candidate, manifest: synManifest(), binding: 'review_only' }).confidence).toBe('unverified');
  });

  it('keeps an approval unverified when its host does not permit automated retrieval', () => {
    const blocked = synManifest({ confirmations: [synClaim({ evidence: [{ ...guideEvidence!, runtime_recheck: 'not_permitted' }] })] });
    const decision = decideConfidence({ ...candidate, manifest: blocked, binding: 'not_checked' });
    expect(decision.confidence).toBe('unverified');
    expect(decision.reason).toContain('does not permit');
  });

  it('fetches only evidence it is permitted to re-read', () => {
    expect([...approvedEvidenceUrls(synManifest())]).toEqual([SYN_GUIDE_URL]);
    expect(approvedEvidenceUrls(videoManifest).size).toBe(0);
    const blocked = synManifest({ confirmations: [synClaim({ evidence: [{ ...guideEvidence!, runtime_recheck: 'not_permitted' }] })] });
    expect(approvedEvidenceUrls(blocked).size).toBe(0);
  });
});

describe('shipped manifest, revision 2', () => {
  it('names its fingerprint normalisation and carries a community registry', () => {
    const manifest = loadManifest();
    expect(manifest.binding).toEqual({ algorithm: 'sha256', normalization: 'collapse-unicode-whitespace-v2', scope: 'reviewed_text_only' });
    expect(Array.isArray(manifest.community_reports)).toBe(true);
    expect(validatePolicy(manifest)).toEqual([]);
  });
});
