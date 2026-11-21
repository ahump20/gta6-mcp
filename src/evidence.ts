// The reviewed evidence manifest: its shape, its policy, and the one function
// allowed to call a cheat row "confirmed". Runtime code can compare bindings;
// it cannot create an approval.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import * as z from 'zod/v4';
import { DPAD, Platform, Provider, SpoilerLevel } from './schemas.js';

const MAX_QUOTE_CHARS = 400;
const MIN_VARIANTS = 2;
const MIN_INDEPENDENT = 2;

const Input = z.array(z.enum(DPAD)).min(1);
const Reviewer = z.object({ identity: z.string().min(1), type: z.enum(['ai_agent', 'human']) });
const Review = z.object({
  reviewer: Reviewer,
  reviewed_at: z.string().min(1),
  decision: z.enum(['approved', 'rejected']),
  reason: z.string().min(1),
});

const EvidenceEntry = z.object({
  url: z.string().min(1),
  quote: z.string().min(1).max(MAX_QUOTE_CHARS),
  evidence_type: z.enum(['official_documentation', 'guide_own_test', 'independent_report']),
  own_test_covers: z.array(z.enum(['input', 'effect', 'platform', 'unlock_timing', 'entry_method'])),
  origin: z.string().min(1).describe('Who originally produced this information.'),
  independence: z.string().min(1).describe('Why this is independent of the other evidence, or why that does not apply.'),
  fingerprint: z.string().startsWith('sha256:').describe('Fingerprint of the reviewed quote.'),
  captured_at: z.string().min(1),
});

const ClaimSchema = z.object({
  claim_id: z.string().min(1),
  game: z.literal('Grand Theft Auto VI'),
  cheat_name: z.string().min(1),
  input: Input,
  effect: z.string().min(1),
  platform: Platform,
  input_method: z.enum(['d-pad', 'phone', 'unknown']),
  entry_steps: z.array(z.string()).nullable(),
  game_version: z.string().nullable(),
  evidence: z.array(EvidenceEntry).min(1),
  review: Review,
});
export type Claim = z.infer<typeof ClaimSchema>;

const VariantEvidence = z.object({
  url: z.string().min(1),
  archive_url: z.string().nullable(),
  quote: z.string().min(1).max(MAX_QUOTE_CHARS),
  captured_at: z.string().min(1),
  lineage: z.string().min(1),
});

const ConflictGroup = z.object({
  conflict_group_id: z.string().min(1),
  cheat_name: z.string().min(1),
  summary: z.string().min(1),
  variants: z
    .array(
      z.object({
        claim_id: z.string().min(1),
        input: Input,
        platform: z.enum(['ps5', 'xbox-series', 'unattributed']),
        reason: z.string().min(1),
        evidence: z.array(VariantEvidence),
      }),
    )
    .min(MIN_VARIANTS),
  review: z.object({ reviewer: Reviewer, reviewed_at: z.string().min(1) }),
});

const Resolution = z.object({
  conflict_group_id: z.string().min(1),
  winning_claim_id: z.string().min(1),
  basis: z.enum(['official_documentation', 'independent_direct_verifications']),
  supporting: z
    .array(z.object({ url: z.string().min(1), quote: z.string().min(1), origin: z.string().min(1), verified_directly: z.boolean() }))
    .min(1),
  rationale: z.string().min(1),
  dispositions: z.array(z.object({ claim_id: z.string().min(1), disposition: z.enum(['upheld', 'rejected']) })),
  review: Review,
});

const SpoilerRegistry = z.object({
  review: z.object({ reviewer: Reviewer, reviewed_at: z.string().min(1), scope_note: z.string().min(1) }),
  titles: z.array(z.object({ provider: Provider, title: z.string().min(1), min_level: SpoilerLevel })),
  sections: z.array(
    z.object({
      provider: Provider,
      title: z.string().min(1),
      heading: z.string(),
      min_level: SpoilerLevel,
      fingerprint: z.string().startsWith('sha256:'),
    }),
  ),
  cheat_rows: z.array(
    z.object({
      name: z.string().min(1),
      row_fingerprint: z.string().startsWith('sha256:'),
      min_level: SpoilerLevel,
      unlock_min_level: SpoilerLevel,
    }),
  ),
  entry_steps: z
    .object({
      provider: Provider,
      title: z.string().min(1),
      heading: z.string().min(1),
      fingerprint: z.string().startsWith('sha256:'),
      min_level: SpoilerLevel,
      input_method: z.enum(['d-pad', 'phone', 'unknown']),
      steps: z.array(z.string().min(1)).min(1),
    })
    .nullable(),
  easter_eggs: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      title_min_level: SpoilerLevel,
      hint: z.string().nullable(),
      detail: z.string().nullable(),
      location: z.string().nullable(),
      prerequisites: z.string().nullable(),
      evidence_status: z.enum(['documented', 'theory', 'unverified']),
      source_url: z.string().min(1),
      quote: z.string().min(1).max(MAX_QUOTE_CHARS),
      fingerprint: z.string().startsWith('sha256:'),
    }),
  ),
  easter_egg_page_titles: z.array(z.string().min(1)),
});
export type SpoilerRegistry = z.infer<typeof SpoilerRegistry>;

export const ManifestSchema = z.object({
  schema_version: z.literal(1),
  synthetic: z.boolean().describe('True only for test fixtures. Production data must be false.'),
  approved_hosts: z.array(
    z.object({ host: z.string().min(1), role: z.enum(['runtime_api', 'official', 'guide']), purpose: z.string().min(1) }),
  ),
  confirmations: z.array(ClaimSchema),
  conflict_groups: z.array(ConflictGroup),
  resolutions: z.array(Resolution),
  spoiler_registry: SpoilerRegistry,
});
export type Manifest = z.infer<typeof ManifestSchema>;

/** Exact hostnames whose reviewed pages may count as evidence. Wikis and research leads are absent by design. */
const ELIGIBLE_HOSTS: Readonly<Record<string, 'official' | 'guide'>> = {
  'www.rockstargames.com': 'official',
  'support.rockstargames.com': 'official',
  'www.take2games.com': 'official',
  'www.playstation.com': 'official',
  'www.xbox.com': 'official',
  'www.ign.com': 'guide',
  'www.gamespot.com': 'guide',
  'www.eurogamer.net': 'guide',
  'www.polygon.com': 'guide',
  'www.pcgamer.com': 'guide',
};

const OWN_TEST_REQUIRED = ['input', 'effect', 'platform'] as const;

export function fingerprint(text: string): string {
  const spaced = ['\n', '\r', '\t'].reduce((out, char) => out.replaceAll(char, ' '), text);
  const normalised = spaced.split(' ').filter((part) => part !== '').join(' ');
  return `sha256:${createHash('sha256').update(normalised).digest('hex')}`;
}

export function manifestJsonSchema(): unknown {
  return z.toJSONSchema(ManifestSchema);
}

export function loadManifest(): Manifest {
  const raw = readFileSync(new URL('../data/evidence.json', import.meta.url), 'utf8');
  return ManifestSchema.parse(JSON.parse(raw));
}

function hostOf(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' ? parsed.host : null;
  } catch {
    return null;
  }
}

function evidenceErrors(claim: Claim, recorded: ReadonlySet<string>): string[] {
  return claim.evidence.flatMap((item) => {
    const host = hostOf(item.url);
    const where = `${claim.claim_id}: ${item.url}`;
    if (host === null) return [`${where} is not an HTTPS URL`];
    const role = ELIGIBLE_HOSTS[host];
    if (role === undefined) return [`${where} is not an eligible evidence host`];
    const problems = [
      recorded.has(host) ? '' : `${where} host is not recorded in approved_hosts`,
      item.evidence_type === 'official_documentation' && role !== 'official' ? `${where} official_documentation needs an official host` : '',
      item.fingerprint === fingerprint(item.quote) ? '' : `${where} fingerprint does not match its quote`,
    ];
    return problems.filter((problem) => problem !== '');
  });
}

function hasApprovalBasis(claim: Claim): boolean {
  const official = claim.evidence.some(
    (item) => item.evidence_type === 'official_documentation' && ELIGIBLE_HOSTS[hostOf(item.url) ?? ''] === 'official',
  );
  const ownTest = claim.evidence.some(
    (item) => item.evidence_type === 'guide_own_test' && OWN_TEST_REQUIRED.every((part) => item.own_test_covers.includes(part)),
  );
  const origins = new Set(claim.evidence.filter((item) => item.evidence_type === 'independent_report').map((item) => item.origin));
  return official || ownTest || origins.size >= MIN_INDEPENDENT;
}

function resolutionErrors(manifest: Manifest): string[] {
  return manifest.resolutions.flatMap((resolution) => {
    const id = resolution.conflict_group_id;
    const group = manifest.conflict_groups.find((g) => g.conflict_group_id === id);
    if (!group) return [`resolution ${id}: no such conflict group`];
    const variantIds = group.variants.map((v) => v.claim_id);
    const direct = new Set(resolution.supporting.filter((s) => s.verified_directly).map((s) => s.origin));
    const officialOnly = resolution.supporting.every((s) => ELIGIBLE_HOSTS[hostOf(s.url) ?? ''] === 'official');
    const problems = [
      variantIds.includes(resolution.winning_claim_id) ? '' : `resolution ${id}: winner is not a variant of the group`,
      variantIds.every((v) => resolution.dispositions.some((d) => d.claim_id === v)) ? '' : `resolution ${id}: every variant needs a disposition`,
      resolution.basis === 'official_documentation' && !officialOnly ? `resolution ${id}: official_documentation needs official hosts` : '',
      resolution.basis === 'independent_direct_verifications' && direct.size < MIN_INDEPENDENT
        ? `resolution ${id}: needs two independent direct verifications`
        : '',
      resolution.supporting.every((s) => ELIGIBLE_HOSTS[hostOf(s.url) ?? ''] !== undefined) ? '' : `resolution ${id}: supporting material must come from eligible hosts`,
    ];
    return problems.filter((problem) => problem !== '');
  });
}

/** Policy checks that a JSON Schema cannot express. Returns one message per violation. */
export function validatePolicy(manifest: Manifest, opts: { readonly allowSynthetic?: boolean } = {}): string[] {
  const recorded = new Set(manifest.approved_hosts.map((h) => h.host));
  const ids = [...manifest.confirmations.map((c) => c.claim_id), ...manifest.conflict_groups.map((g) => g.conflict_group_id)];
  const approved = manifest.confirmations.filter((claim) => claim.review.decision === 'approved');
  return [
    manifest.synthetic && !opts.allowSynthetic ? 'synthetic data cannot be used as production evidence' : '',
    new Set(ids).size === ids.length ? '' : 'claim and conflict group ids must be unique',
    ...approved.flatMap((claim) => evidenceErrors(claim, recorded)),
    ...approved.map((claim) => (hasApprovalBasis(claim) ? '' : `${claim.claim_id}: no sufficient approval basis`)),
    ...manifest.conflict_groups.map((group) =>
      new Set(group.variants.map((v) => v.input.join(','))).size === group.variants.length
        ? ''
        : `${group.conflict_group_id}: variants must differ in input`,
    ),
    ...resolutionErrors(manifest),
  ].filter((problem) => problem !== '');
}

/** Evidence URLs of approved claims: the only non-wiki URLs the server may fetch. */
export function approvedEvidenceUrls(manifest: Manifest): Set<string> {
  return new Set(
    manifest.confirmations
      .filter((claim) => claim.review.decision === 'approved')
      .flatMap((claim) => claim.evidence.map((item) => new URL(item.url).href)),
  );
}

export type Binding = 'match' | 'changed' | 'unavailable' | 'not_checked';

export interface Candidate {
  readonly name: string;
  readonly input: readonly string[] | null;
  readonly platform: 'ps5' | 'xbox-series' | 'unattributed';
  readonly extractionIssue: boolean;
}

export interface Decision {
  readonly confidence: 'confirmed' | 'unverified' | 'conflicting';
  readonly reason: string;
  readonly conflict_group_id: string | null;
  readonly claim_id: string | null;
}

const sameName = (a: string, b: string): boolean => a.trim().toLowerCase() === b.trim().toLowerCase();
const sameInput = (a: readonly string[] | null, b: readonly string[]): boolean => a !== null && a.join(',') === b.join(',');

export function findApproval(manifest: Manifest, candidate: Candidate): Claim | null {
  return (
    manifest.confirmations.find(
      (claim) =>
        claim.review.decision === 'approved' &&
        sameName(claim.cheat_name, candidate.name) &&
        sameInput(candidate.input, claim.input) &&
        claim.platform === candidate.platform,
    ) ?? null
  );
}

const BINDING_REASONS: Readonly<Record<Exclude<Binding, 'match'>, string>> = {
  changed: 'Reviewed evidence no longer contains the reviewed text; the approval is withheld until it is reviewed again.',
  unavailable: 'Reviewed evidence could not be re-read, so the approval is withheld.',
  not_checked: 'Reviewed evidence was not re-read, so the approval is withheld.',
};

export function decideConfidence(args: Candidate & { readonly manifest: Manifest; readonly binding: Binding }): Decision {
  const { manifest, binding } = args;
  const group = manifest.conflict_groups.find((g) => sameName(g.cheat_name, args.name));
  const conflict_group_id = group?.conflict_group_id ?? null;
  const resolution = manifest.resolutions.find((r) => r.conflict_group_id === conflict_group_id);
  const approval = findApproval(manifest, args);
  const claim_id = approval?.claim_id ?? null;
  const unverified = (reason: string): Decision => ({ confidence: 'unverified', reason, conflict_group_id, claim_id });

  if (group && !resolution) {
    return {
      confidence: 'conflicting',
      reason: `Sources disagree on this input and no reviewed resolution exists. ${group.summary}`,
      conflict_group_id,
      claim_id,
    };
  }
  if (args.extractionIssue) return unverified('The input could not be read reliably from the source, so it is reported as unknown.');
  const variant = group?.variants.find((v) => sameInput(args.input, v.input));
  const rejected = resolution?.dispositions.some((d) => d.claim_id === variant?.claim_id && d.disposition === 'rejected') ?? false;
  if (rejected) return unverified('This variant was rejected by a reviewed resolution of the conflict.');
  if (!approval) {
    return unverified(
      'No reviewed approval exists. No official documentation, own test by an eligible guide, or pair of independent reports covers this exact input, effect and platform. A wiki entry or citation is not confirmation.',
    );
  }
  if (validatePolicy({ ...manifest, confirmations: [approval] }, { allowSynthetic: true }).length > 0) {
    return unverified('The recorded approval does not satisfy the evidence policy.');
  }
  if (binding !== 'match') return unverified(BINDING_REASONS[binding]);
  return { confidence: 'confirmed', reason: approval.review.reason, conflict_group_id, claim_id };
}
