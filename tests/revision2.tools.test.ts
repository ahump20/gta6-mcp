// Revision 2 tool behaviour: gta.wiki as a known gap, community reports, video-backed rows.
// Everything built from tests/synthetic.ts is SYNTHETIC.
import { describe, expect, it } from 'vitest';
import { loadManifest } from '../src/evidence.js';
import { isAllowed } from '../src/net.js';
import { type Deps, easterEggs, getPage, listCheats, renderText, searchGta6 } from '../src/tools.js';
import { type Route, fakeHttp, fixtureJson, okJson } from './helpers.js';
import { SYN_POST_URL, SYN_REVIEWED_AT, SYN_WIKITEXT, synManifest, synReport, synVideoClaim, synVideoEvidence } from './synthetic.js';

const NONE: ReadonlySet<string> = new Set();
const SEARCH_LIMIT = 5;
const MARKER = 'COMMUNITYMARKER7Q';
const real = loadManifest();
const cheatsPage: Route = { match: ['gta.fandom.com', 'page=Cheats in GTA VI'], result: okJson(fixtureJson('real/fandom-parse-cheats-gta-vi.json')) };
const missingPage: Route = { match: ['action=parse'], result: okJson(fixtureJson('real/fandom-parse-missingtitle.json')) };
const synPage: Route = { match: ['page=Cheats in GTA VI'], result: okJson({ parse: { title: 'Cheats in GTA VI', revid: 1, wikitext: SYN_WIKITEXT } }) };
const searchRoutes: readonly Route[] = [
  { match: ['gta.fandom.com', 'list=search'], result: okJson(fixtureJson('real/fandom-search-cheats.json')) },
  { match: ['gta.fandom.com', 'prop=categories'], result: okJson(fixtureJson('real/fandom-categories-search-hits.json')) },
  { match: ['en.wikipedia.org', 'list=search'], result: okJson(fixtureJson('real/wikipedia-search-gta-vi.json')) },
];
const mentionsGap = (out: { notices: readonly { type: string; message: string }[] }): boolean =>
  out.notices.some((n) => n.type === 'coverage_gap' && n.message.includes('gta.wiki'));
const serialised = (out: Parameters<typeof renderText>[0]): string => `${JSON.stringify(out)}\n${renderText(out)}`;

describe('gta.wiki is known and never requested', () => {
  it('refuses gta.wiki and every social host at the network layer', () => {
    for (const url of [
      'https://gta.wiki/api.php?action=query&list=search&srsearch=x&format=json',
      'https://www.reddit.com/r/GTA6/',
      'https://x.com/someone/status/1',
      'https://www.youtube.com/watch?v=abc',
      'https://www.tiktok.com/@someone/video/1',
    ]) {
      expect(isAllowed(url, NONE)).toBe(false);
    }
  });

  it('answers get_page(source: gtawiki) without a request and says why', async () => {
    const http = fakeHttp([]);
    const out = await getPage({ title: 'Cheats in GTA VI', source: 'gtawiki', spoilers: 'full' }, { http, manifest: real });
    expect(out.status).toBe('upstream_unavailable');
    expect(out.results).toEqual([]);
    expect(http.requests).toEqual([]);
    expect(out.notices.map((n) => n.type)).toEqual(['coverage_gap']);
    expect(out.notices[0]?.message).toContain('consent');
  });

  it('names the gap in search, cheats and Easter egg results', async () => {
    const deps = (routes: readonly Route[]): Deps => ({ http: fakeHttp(routes), manifest: real });
    expect(mentionsGap(await searchGta6({ query: 'GTA VI cheats', limit: SEARCH_LIMIT, spoilers: 'hints' }, deps(searchRoutes)))).toBe(true);
    expect(mentionsGap(await listCheats({ include_unverified: true, spoilers: 'full' }, deps([cheatsPage])))).toBe(true);
    expect(mentionsGap(await easterEggs({ spoilers: 'hints' }, deps([missingPage])))).toBe(true);
  });
});

describe('community reports in list_cheats', () => {
  const withReport = (report = synReport()): Deps => ({
    http: fakeHttp([synPage]),
    manifest: synManifest({ confirmations: [], community_reports: [report] }),
  });

  it('adds a reviewed report as an unverified row when asked', async () => {
    const out = await listCheats({ include_unverified: true, spoilers: 'hints' }, withReport());
    const row = out.results.find((r) => r.claim_id === 'syn-report-1');
    expect(row).toMatchObject({ name: 'Community Cheat', input: ['Left', 'Right'], input_status: 'known', platform: 'ps5', confidence: 'unverified', source_page_url: SYN_POST_URL });
    expect(row?.evidence).toEqual([
      {
        url: SYN_POST_URL,
        claim_text_reviewed: synReport().description,
        revision_or_fetched_at: SYN_REVIEWED_AT,
        time_basis: 'captured_at',
        evidence_type: 'community_report',
        social_platform: 'reddit',
        author_handle: 'u/synthetic_author',
        posted_at: '2026-11-20T12:00:00Z',
      },
    ]);
    expect(row?.reason.toLowerCase()).toContain('community report');
    expect(row?.reason).toContain('no eligible confirmation');
  });

  it('leaves community reports out by default', async () => {
    const out = await listCheats({ include_unverified: false, spoilers: 'full' }, withReport());
    expect(out.results.some((r) => r.claim_id === 'syn-report-1')).toBe(false);
  });

  it('honours the platform filter', async () => {
    const ps5 = await listCheats({ platform: 'ps5', include_unverified: true, spoilers: 'hints' }, withReport());
    const xbox = await listCheats({ platform: 'xbox-series', include_unverified: true, spoilers: 'hints' }, withReport());
    expect(ps5.results.some((r) => r.claim_id === 'syn-report-1')).toBe(true);
    expect(xbox.results.some((r) => r.claim_id === 'syn-report-1')).toBe(false);
  });

  it('withholds a report below its reviewed level and leaks none of it', async () => {
    const hidden = synReport({ min_level: 'discovery', description: `SYNTHETIC ${MARKER} claim`, author_handle: `u/${MARKER}`, url: `https://www.reddit.com/r/synthetic/comments/${MARKER}/` });
    const hints = await listCheats({ include_unverified: true, spoilers: 'hints' }, withReport(hidden));
    expect(serialised(hints)).not.toContain(MARKER);
    expect(hints.notices.map((n) => n.type)).toContain('spoiler_withheld');
    const discovery = await listCheats({ include_unverified: true, spoilers: 'discovery' }, withReport(hidden));
    expect(discovery.results.some((r) => r.claim_id === 'syn-report-1')).toBe(true);
  });
});

describe('community reports in easter_eggs', () => {
  const egg = synReport({ id: 'syn-egg-1', evidence_type: 'screenshot', subject: { kind: 'easter_egg', title: 'Synthetic Egg', evidence_status: 'theory' } });
  const withEgg = (report = egg): Deps => ({ http: fakeHttp([missingPage]), manifest: synManifest({ confirmations: [], community_reports: [report] }) });

  it('returns a reviewed report as a labelled theory', async () => {
    const out = await easterEggs({ spoilers: 'hints' }, withEgg());
    expect(out.status).toBe('ok');
    expect(out.results).toEqual([
      {
        title: 'Synthetic Egg',
        hint: null,
        detail: egg.description,
        location: null,
        prerequisites: null,
        spoiler_class: 'hints',
        confidence: 'unverified',
        evidence_status: 'theory',
        source_url: SYN_POST_URL,
        community: { social_platform: 'reddit', author_handle: 'u/synthetic_author', posted_at: '2026-11-20T12:00:00Z' },
      },
    ]);
  });

  it('withholds it below its reviewed level', async () => {
    const out = await easterEggs({ spoilers: 'hints' }, withEgg({ ...egg, min_level: 'full', description: `SYNTHETIC ${MARKER}` }));
    expect(out.status).toBe('partial');
    expect(out.results).toEqual([]);
    expect(serialised(out)).not.toContain(MARKER);
  });
});

describe('video-backed confirmation', () => {
  const manifest = synManifest({ confirmations: [synVideoClaim([synVideoEvidence(1), synVideoEvidence(2)])] });

  it('confirms from the review record, fetches no social host, and says when it was last checked', async () => {
    const http = fakeHttp([synPage]);
    const out = await listCheats({ include_unverified: false, spoilers: 'full' }, { http, manifest });
    const row = out.results.find((r) => r.claim_id === 'syn-video-ps5');
    expect(row?.confidence).toBe('confirmed');
    expect(http.requests.some((url) => url.includes('youtube'))).toBe(false);
    expect(row?.evidence.map((e) => [e.evidence_type, e.time_basis, e.revision_or_fetched_at, e.social_platform, e.author_handle])).toEqual([
      ['gameplay_video', 'review', SYN_REVIEWED_AT, 'youtube', '@synthetic-channel-1'],
      ['gameplay_video', 'review', SYN_REVIEWED_AT, 'youtube', '@synthetic-channel-2'],
    ]);
    expect(out.notices.some((n) => n.message.includes('last checked at review'))).toBe(true);
  });

  it('does not let a stale wiki page renew a video-backed confirmation', async () => {
    const stale: Route = { match: ['page=Cheats in GTA VI'], result: okJson({ parse: { title: 'Cheats in GTA VI', revid: 1, wikitext: SYN_WIKITEXT } }, true) };
    const out = await listCheats({ include_unverified: true, spoilers: 'full' }, { http: fakeHttp([stale]), manifest });
    expect(out.results.find((r) => r.name === 'Confirmed Cheat')?.confidence).toBe('unverified');
  });
});
