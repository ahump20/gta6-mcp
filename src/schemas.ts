import * as z from 'zod/v4';

export const DEFAULT_SEARCH_LIMIT = 5;
export const MAX_SEARCH_LIMIT = 10;
export const MAX_PAGE_CHARS = 20_000;
const MAX_ARG_CHARS = 200;
export const WITHHELD_MESSAGE = 'Content withheld by spoiler policy.';

export const SpoilerLevel = z.enum(['hints', 'discovery', 'full']);
export type SpoilerLevel = z.infer<typeof SpoilerLevel>;

const spoilers = SpoilerLevel.default('hints').describe(
  'How much to reveal. hints (default): reviewed, spoiler-safe cues only. discovery: reviewed secret details. full: bounded source text, labelled unreviewed where no review covers it.',
);

export const Status = z.enum([
  'ok',
  'no_verified_results',
  'not_found_page',
  'not_found_section',
  'upstream_unavailable',
  'partial',
]);
export type Status = z.infer<typeof Status>;

export const NoticeType = z.enum([
  'truncated',
  'stale_cache',
  'conflict',
  'coverage_gap',
  'unresolved_template',
  'spoiler_withheld',
]);
export type NoticeType = z.infer<typeof NoticeType>;

export const Notice = z.object({ type: NoticeType, message: z.string() });
export type Notice = z.infer<typeof Notice>;

export const Source = z.object({
  title: z.string(),
  url: z.string(),
  revision_id: z.number().optional(),
  retrieved_at: z.string(),
  license: z.string(),
  attribution: z.string(),
});
export type Source = z.infer<typeof Source>;

/** Providers the server queries. */
export const Provider = z.enum(['fandom', 'wikipedia']);
export type Provider = z.infer<typeof Provider>;

/** Sources `get_page` accepts. `gtawiki` is recognised and never queried: its host requires consent for automated use. */
export const PageSource = z.enum(['gtawiki', 'fandom', 'wikipedia']);
export type PageSource = z.infer<typeof PageSource>;

export const SocialPlatform = z.enum(['reddit', 'x', 'youtube', 'tiktok', 'forum']);
export type SocialPlatform = z.infer<typeof SocialPlatform>;

export const Platform = z.enum(['ps5', 'xbox-series']);
export type Platform = z.infer<typeof Platform>;

export const SearchInput = z.object({
  query: z.string().min(1).max(MAX_ARG_CHARS).describe('What to look for in GTA VI.'),
  limit: z.number().int().min(1).max(MAX_SEARCH_LIMIT).default(DEFAULT_SEARCH_LIMIT),
  spoilers,
});

export const PageInput = z.object({
  title: z.string().min(1).max(MAX_ARG_CHARS).describe('Wiki page title, for example "Cheats in GTA VI".'),
  section: z.string().min(1).max(MAX_ARG_CHARS).optional().describe('Section heading to return instead of the whole page.'),
  source: PageSource.default('fandom').describe(
    'fandom for gameplay (default), wikipedia for background. gtawiki is recognised but not queried: gta.wiki requires consent for automated use.',
  ),
  spoilers,
});

export const CheatsInput = z.object({
  platform: Platform.optional().describe('Only rows a source attributes to this platform.'),
  include_unverified: z
    .boolean()
    .default(false)
    .describe('Also return unverified and conflicting reports. They are reports, not working codes.'),
  spoilers,
});

export const EggsInput = z.object({
  topic: z.string().min(1).max(MAX_ARG_CHARS).optional(),
  spoilers,
});

export const SearchHit = z.object({
  title: z.string(),
  snippet: z.string().nullable(),
  url: z.string(),
  provider: Provider,
  disclosure: z.enum(['reviewed', 'unreviewed']),
  evidence_label: z.enum(['wiki_source_reported', 'background']),
});
export type SearchHit = z.infer<typeof SearchHit>;

export const PageResult = z.object({
  title: z.string(),
  section: z.string().nullable(),
  text: z.string(),
  references: z.array(z.string()),
  review_status: z.enum(['reviewed', 'unreviewed_untrusted']),
  truncated: z.boolean(),
});
export type PageResult = z.infer<typeof PageResult>;

export const EvidenceItem = z.object({
  url: z.string(),
  claim_text_reviewed: z.string().nullable(),
  revision_or_fetched_at: z.string(),
  time_basis: z.enum(['revision', 'fetched_at', 'captured_at', 'review']),
  evidence_type: z.enum(['community_report', 'gameplay_video']).optional(),
  social_platform: SocialPlatform.optional(),
  author_handle: z.string().optional(),
  posted_at: z.string().optional(),
});
export type EvidenceItem = z.infer<typeof EvidenceItem>;

export const DPAD = ['Up', 'Down', 'Left', 'Right'] as const;

export const CheatRow = z
  .object({
    claim_id: z.string(),
    name: z.string(),
    input: z.array(z.enum(DPAD)).min(1).nullable(),
    input_status: z.enum(['known', 'unknown', 'undiscovered']),
    input_method: z.enum(['d-pad', 'phone', 'unknown']),
    entry_steps: z.array(z.string()).nullable(),
    platform: z.enum(['ps5', 'xbox-series', 'unattributed']),
    effect: z.string().nullable(),
    unlock_requirement: z.string().nullable(),
    unlock_spoiler_class: z.enum(['hints', 'discovery', 'full', 'unclassified']),
    game_version: z.string().nullable(),
    confidence: z.enum(['confirmed', 'unverified', 'conflicting']),
    conflict_group_id: z.string().nullable(),
    evidence: z.array(EvidenceItem),
    reason: z.string(),
    source_page_url: z.string(),
  })
  .refine((r) => (r.input_status === 'known') === (r.input !== null), {
    message: 'input is present exactly when input_status is known',
  });
export type CheatRow = z.infer<typeof CheatRow>;

export const EggResult = z.object({
  title: z.string(),
  hint: z.string().nullable(),
  detail: z.string().nullable(),
  location: z.string().nullable(),
  prerequisites: z.string().nullable(),
  spoiler_class: z.enum(['hints', 'discovery', 'full', 'unclassified']),
  confidence: z.enum(['confirmed', 'unverified']),
  evidence_status: z.enum(['documented', 'theory', 'unverified']),
  source_url: z.string(),
  community: z.object({ social_platform: SocialPlatform, author_handle: z.string(), posted_at: z.string() }).optional(),
});
export type EggResult = z.infer<typeof EggResult>;

function envelopeOf<T extends z.ZodType>(result: T) {
  return z.object({
    status: Status,
    summary: z.string(),
    results: z.array(result),
    sources: z.array(Source),
    notices: z.array(Notice),
  });
}

export const SearchOutput = envelopeOf(SearchHit);
export const PageOutput = envelopeOf(PageResult);
export const CheatsOutput = envelopeOf(CheatRow);
export const EggsOutput = envelopeOf(EggResult);

export interface Envelope<T> {
  readonly status: Status;
  readonly summary: string;
  readonly results: readonly T[];
  readonly sources: readonly Source[];
  readonly notices: readonly Notice[];
}

const NOTICE_DEFAULTS: Readonly<Partial<Record<NoticeType, string>>> = {
  spoiler_withheld: WITHHELD_MESSAGE,
};

export function notice(type: NoticeType, message?: string): Notice {
  return { type, message: message ?? NOTICE_DEFAULTS[type] ?? type };
}
