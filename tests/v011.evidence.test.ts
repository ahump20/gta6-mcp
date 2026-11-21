// SYNTHETIC decision-logic tests for the evidence rules settled in v0.1.1.
import { describe, expect, it } from 'vitest';
import { type Binding, type Manifest, decideConfidence, fingerprint, loadManifest, validatePolicy } from '../src/evidence.js';
import { synClaim, synConflict, synManifest, synReport, synResolution, synVideoClaim, synVideoEvidence } from './synthetic.js';

const SYNTHETIC_OK = { allowSynthetic: true };
const TWO = 2;
type Support = Manifest['resolutions'][number]['supporting'][number];
type Which = Parameters<typeof synVideoEvidence>[0];
type VideoPatch = Partial<NonNullable<Manifest['confirmations'][number]['evidence'][number]['video']>>;

function videoSupport(n: Which, video: VideoPatch = {}): Support {
  const item = synVideoEvidence(n, {}, video);
  return { url: item.url, quote: item.quote, origin: item.origin, verified_directly: true, ...(item.video ? { video: item.video } : {}) };
}

function resolved(supporting: Support[], patch: Partial<Manifest> = {}): Manifest {
  return synManifest({ conflict_groups: [synConflict], resolutions: [{ ...synResolution(TWO), supporting }], ...patch });
}

const problems = (manifest: Manifest): string => validatePolicy(manifest, SYNTHETIC_OK).join(' ');
const decide = (manifest: Manifest, binding: Binding): string =>
  decideConfidence({ name: 'Confirmed Cheat', input: ['Up', 'Down'], platform: 'ps5', extractionIssue: false, manifest, binding }).confidence;

describe('fingerprint normalisation', () => {
  it.each([
    ['a no-break space', ' '],
    ['an em space', ' '],
    ['a narrow no-break space', ' '],
    ['an ideographic space', '　'],
    ['a line separator', ' '],
  ])('treats %s like an ordinary space', (_label, space) => {
    expect(fingerprint(`Up,${space}Down`)).toBe(fingerprint('Up, Down'));
  });

  it('still tells different text apart', () => {
    expect(fingerprint('Up, Down')).not.toBe(fingerprint('Up, Left'));
  });

  it('is named in the shipped manifest', () => {
    expect(loadManifest().binding.normalization).toBe('collapse-unicode-whitespace-v2');
  });
});

describe('a conflict resolved by gameplay video', () => {
  it('accepts two frame-inspected videos from separate accounts', () => {
    expect(validatePolicy(resolved([videoSupport(1), videoSupport(TWO)]), SYNTHETIC_OK)).toEqual([]);
  });

  it('rejects a single video', () => {
    expect(problems(resolved([videoSupport(1)]))).toContain('two independent direct verifications');
  });

  it('rejects two videos from one account', () => {
    const sameAccount = videoSupport(TWO, { account: videoSupport(1).video?.account ?? '' });
    expect(problems(resolved([videoSupport(1), sameAccount]))).toContain('two independent direct verifications');
  });

  it('rejects one video listed under two origins', () => {
    const relabelled = { ...videoSupport(TWO), url: videoSupport(1).url };
    expect(problems(resolved([videoSupport(1), relabelled]))).toContain('two independent direct verifications');
  });

  it('rejects three videos in which every pair shares a URL, an origin or an account', () => {
    const one = videoSupport(1);
    const two = videoSupport(TWO);
    const trio = [one, { ...two, url: one.url }, { ...two, origin: one.origin }];
    expect(problems(resolved(trio))).toContain('two independent direct verifications');
  });

  it('does not approve a claim on three such videos either', () => {
    const one = synVideoEvidence(1);
    const two = synVideoEvidence(TWO);
    const claim = synVideoClaim([one, { ...two, url: one.url }, { ...two, origin: one.origin }], { claim_id: 'syn-confirmed-ps5' });
    expect(problems(synManifest({ confirmations: [claim] }))).toContain('no sufficient approval basis');
  });

  it('rejects a video reviewed from its transcript', () => {
    expect(problems(resolved([videoSupport(1), videoSupport(TWO, { review_basis: 'transcript' })]))).toContain('not its frames');
  });

  it('rejects footage that is not continuous', () => {
    expect(problems(resolved([videoSupport(1), videoSupport(TWO, { continuous_footage: false })]))).toContain('not continuous footage');
  });

  it('rejects a social link that carries no video review', () => {
    const { video: _dropped, ...bare } = videoSupport(TWO);
    expect(problems(resolved([videoSupport(1), bare]))).toContain('needs a video review record');
  });

  it('rejects a registry lead that has no frame review of its own', () => {
    const lead = synReport({ id: 'syn-lead', url: videoSupport(1).url, evidence_type: 'gameplay_video', video_review: null });
    expect(problems(resolved([videoSupport(1), videoSupport(TWO)], { community_reports: [lead] }))).toContain('community report');
  });

  it('still rejects a host that is neither eligible nor a video host', () => {
    const blog = { ...videoSupport(TWO), url: 'https://blog.example/synthetic' };
    expect(problems(resolved([videoSupport(1), blog]))).toContain('eligible hosts');
  });

  it('confirms the upheld variant once its video approval is on record', () => {
    const winner = synVideoClaim([synVideoEvidence(1), synVideoEvidence(TWO)], { claim_id: 'syn-confirmed-ps5' });
    const manifest = resolved([videoSupport(1), videoSupport(TWO)], { confirmations: [winner] });
    expect(validatePolicy(manifest, SYNTHETIC_OK)).toEqual([]);
    expect(decide(manifest, 'review_only')).toBe('confirmed');
  });
});

describe('mixed video and guide evidence', () => {
  it('needs the re-readable part to match, since a video cannot stand in for it', () => {
    const [guide] = synClaim().evidence;
    const manifest = synManifest({ confirmations: [synClaim({ evidence: guide ? [guide, synVideoEvidence(1)] : [] })] });
    expect(validatePolicy(manifest, SYNTHETIC_OK)).toEqual([]);
    expect(decide(manifest, 'match')).toBe('confirmed');
    expect(decide(manifest, 'review_only')).toBe('unverified');
  });

  it('stays unverified when any item sits on a host that cannot be re-read', () => {
    const [guide] = synClaim().evidence;
    const offline = guide ? [{ ...guide, evidence_type: 'independent_report' as const, own_test_covers: [], runtime_recheck: 'not_permitted' as const }] : [];
    const manifest = synManifest({ confirmations: [synVideoClaim([synVideoEvidence(1), synVideoEvidence(TWO), ...offline], { claim_id: 'syn-confirmed-ps5' })] });
    expect(validatePolicy(manifest, SYNTHETIC_OK)).toEqual([]);
    expect(decide(manifest, 'match')).toBe('unverified');
    expect(decide(manifest, 'review_only')).toBe('unverified');
  });
});
