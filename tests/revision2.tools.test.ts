// Revision 2 tool behaviour: gta.wiki as a known gap, community reports, video-backed rows.
// Everything built from tests/synthetic.ts is SYNTHETIC.
import { describe, expect, it } from 'vitest';
import { loadManifest } from '../src/evidence.js';
import { isAllowed } from '../src/net.js';
import { type Deps, easterEggs, getPage, listCheats, renderText, searchGta6 } from '../src/tools.js';
import { type Route, fakeHttp, fixtureJson, okJson } from './helpers.js';
import { SYN_POST_URL, SYN_REVIEWED_AT, SYN_WIKITEXT, synConflict, synManifest, synReport, synVideoClaim, synVideoEvidence } from './synthetic.js';

const NONE: ReadonlySet<string> = new Set();
const SEARCH_LIMIT = 5;
const MARKER = 'COMMUNITYMARKER7Q';
/** Cheats other than Attack Force that the reviewed community captions list. */
const OTHER_REPORTED_CODES = 17;
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
    expect(mentionsGap(await easterEggs({ spoilers: 'discovery' }, deps([missingPage])))).toBe(true);
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

describe('Fandom off (no recorded permission)', () => {
  const off: Route = { match: ['gta.fandom.com'], result: { ok: false, reason: 'not_permitted', detail: 'simulated' } };
  const SETTING = 'GTA6_MCP_FANDOM_PERMISSION';
  const names = (out: { notices: readonly { message: string }[] }): boolean => out.notices.some((n) => n.message.includes(SETTING));

  it('says how to turn the wiki on instead of reporting an outage', async () => {
    const deps: Deps = { http: fakeHttp([off, ...searchRoutes]), manifest: real };
    const page = await getPage({ title: 'Cheats in GTA VI', source: 'fandom', spoilers: 'hints' }, deps);
    expect(page.status).toBe('upstream_unavailable');
    expect(names(page)).toBe(true);
    const search = await searchGta6({ query: 'GTA VI cheats', limit: SEARCH_LIMIT, spoilers: 'hints' }, deps);
    expect(search.status).toBe('partial');
    expect(search.results.every((r) => r.provider === 'wikipedia')).toBe(true);
    expect(names(search)).toBe(true);
    const confirmedOnly = await listCheats({ include_unverified: false, spoilers: 'hints' }, deps);
    expect(confirmedOnly.status).toBe('upstream_unavailable');
    expect(names(confirmedOnly)).toBe(true);
  });

  it('still returns the recorded Attack Force dispute and the reported codes, none of them confirmed', async () => {
    const out = await listCheats({ include_unverified: true, spoilers: 'hints' }, { http: fakeHttp([off]), manifest: real });
    expect(out.status).toBe('partial');
    const dispute = out.results.filter((r) => r.name === 'Attack Force');
    expect(dispute.map((r) => [r.confidence, r.conflict_group_id, r.input?.length, new URL(r.evidence[0]?.url ?? '').host])).toEqual([
      ['conflicting', 'cg-attack-force', 8, 'www.gamespot.com'],
      ['conflicting', 'cg-attack-force', 9, 'www.pcgamer.com'],
      ['conflicting', 'cg-attack-force', 9, 'www.youtube.com'],
      ['conflicting', 'cg-attack-force', 9, 'www.youtube.com'],
      ['conflicting', 'cg-attack-force', 9, 'www.youtube.com'],
    ]);
    expect(dispute[2]?.evidence[0]).toMatchObject({ evidence_type: 'community_report', social_platform: 'youtube', author_handle: '@JOETHzz', posted_at: '2026-11-19T03:00:22Z' });
    const others = out.results.filter((r) => r.name !== 'Attack Force');
    expect(others).toHaveLength(OTHER_REPORTED_CODES);
    expect(new Set(others.map((r) => r.name)).size).toBe(OTHER_REPORTED_CODES);
    expect(others.every((r) => r.confidence === 'unverified' && r.conflict_group_id === null && r.platform === 'unattributed' && r.effect === null)).toBe(true);
    expect(others.every((r) => r.evidence[0]?.evidence_type === 'community_report' && r.reason.toLowerCase().includes('community report'))).toBe(true);
    expect(out.results.some((r) => r.confidence === 'confirmed')).toBe(false);
    expect(out.notices.map((n) => n.type)).toContain('conflict');
    expect(names(out)).toBe(true);
    expect(out.summary).toContain('0 confirmed');
  });

  it('returns community reports alongside, and withholds a dispute below its reviewed level', async () => {
    const manifest = synManifest({ confirmations: [], community_reports: [synReport()], conflict_groups: [{ ...synConflict, min_level: 'discovery' }] });
    const hints = await listCheats({ include_unverified: true, spoilers: 'hints' }, { http: fakeHttp([off]), manifest });
    expect(hints.results.map((r) => r.claim_id)).toEqual(['syn-report-1']);
    expect(hints.notices.map((n) => n.type)).toContain('spoiler_withheld');
    const discovery = await listCheats({ include_unverified: true, spoilers: 'discovery' }, { http: fakeHttp([off]), manifest });
    expect(discovery.results.map((r) => r.claim_id)).toEqual(['syn-confirmed-ps5', 'syn-confirmed-ps5-b', 'syn-report-1']);
  });
});

describe('borrowed filter cases (Ro25v04/gta6-mcp, MIT)', () => {
  const hit = (title: string): Route[] => [
    { match: ['gta.fandom.com', 'list=search'], result: okJson({ query: { search: [{ title }] } }) },
    { match: ['gta.fandom.com', 'prop=categories'], result: okJson({ query: { pages: [{ title, categories: [{ title: 'Category:Characters in GTA VI' }] }] } }) },
    { match: ['en.wikipedia.org', 'list=search'], result: okJson({ query: { search: [] } }) },
  ];
  const titles = async (routes: readonly Route[]): Promise<string[]> =>
    (await searchGta6({ query: 'q', limit: SEARCH_LIMIT, spoilers: 'full' }, { http: fakeHttp(routes), manifest: real })).results.map((r) => r.title);

  it.each(['infobox', 'artwork', 'screenshots', 'trailers', 'gallery'])('skips the %s helper sub-page', async (sub) => {
    expect(await titles(hit(`Lucia Caminos/${sub}`))).toEqual([]);
  });

  it('keeps an ordinary GTA VI article', async () => {
    expect(await titles(hit('Lucia Caminos'))).toEqual(['Lucia Caminos']);
  });

  it('does not take Vice City for GTA VI', async () => {
    const routes: Route[] = [
      { match: ['gta.fandom.com', 'list=search'], result: okJson({ query: { search: [{ title: 'Ocean Drive' }] } }) },
      { match: ['gta.fandom.com', 'prop=categories'], result: okJson({ query: { pages: [{ title: 'Ocean Drive', categories: [{ title: 'Category:Streets in GTA Vice City' }] }] } }) },
      { match: ['en.wikipedia.org', 'list=search'], result: okJson({ query: { search: [] } }) },
    ];
    expect(await titles(routes)).toEqual([]);
  });
});

describe('shipped community registry', () => {
  const deps = (): Deps => ({ http: fakeHttp([missingPage]), manifest: real });

  it('withholds the reported Easter egg at hints and returns it, labelled, at discovery', async () => {
    const hints = await easterEggs({ spoilers: 'hints' }, deps());
    expect(hints).toMatchObject({ status: 'partial', results: [] });
    // The default call says how many entries a higher level would show, and never what they are.
    expect(hints.summary).toContain('19 recorded entries are held back');
    expect(JSON.stringify(hints)).not.toMatch(/Dexter|Skunk|tower/i);
    const discovery = await easterEggs({ spoilers: 'discovery' }, deps());
    expect(discovery.status).toBe('ok');
    expect(discovery.results).toHaveLength(19);
    const listed = discovery.results.filter((r) => r.community === undefined);
    expect(listed).toHaveLength(18);
    expect(listed.every((r) => r.evidence_status === 'unverified' && r.confidence === 'unverified' && r.detail?.includes('Not viewed in the game by this project.'))).toBe(true);
    expect(discovery.results.find((r) => r.community !== undefined)).toMatchObject({ confidence: 'unverified', evidence_status: 'unverified', source_url: 'https://www.youtube.com/watch?v=Mj_beVHUJE4', community: { social_platform: 'youtube', author_handle: '@MrDalekJD' } });
  });

  it('records no video review, since no inspected video shows a code entered with its effect', () => {
    expect(real.community_reports.every((r) => r.video_review === null)).toBe(true);
    const cheats = real.community_reports.flatMap((r) => (r.subject.kind === 'cheat' ? [r.subject] : []));
    expect(cheats.every((c) => c.platform === 'unattributed' && c.effect === null)).toBe(true);
    expect(real.confirmations).toEqual([]);
  });

  it('stores no post text: every description is one reviewer-written line', () => {
    for (const report of real.community_reports) {
      expect(report.description.includes('\n')).toBe(false);
      expect(Date.parse(report.posted_at)).toBeGreaterThanOrEqual(Date.parse('2026-11-19T00:00:00Z'));
    }
  });
});

describe('list_cheats default call with Fandom off', () => {
  it('returns no rows but says how many recorded reports can be asked for', async () => {
    const off: Route = { match: ['gta.fandom.com'], result: { ok: false, reason: 'not_permitted', detail: 'simulated' } };
    const out = await listCheats({ include_unverified: false, spoilers: 'hints' }, { http: fakeHttp([off]), manifest: real });
    expect(out.results).toEqual([]);
    expect(out.summary).toContain('22 recorded report(s) are available with include_unverified=true');
  });
});

describe('easter_eggs with Fandom off', () => {
  const off: Route = { match: ['gta.fandom.com'], result: { ok: false, reason: 'not_permitted', detail: 'simulated' } };

  it('says a report is withheld rather than calling the wiki unavailable', async () => {
    const out = await easterEggs({ spoilers: 'hints' }, { http: fakeHttp([off]), manifest: real });
    expect(out).toMatchObject({ status: 'partial', results: [] });
    expect(out.notices.map((n) => n.type)).toContain('spoiler_withheld');
    expect(out.notices.filter((n) => n.message.includes('GTA6_MCP_FANDOM_PERMISSION'))).toHaveLength(1);
  });

  it('names the setting once when a report is returned', async () => {
    const out = await easterEggs({ spoilers: 'discovery' }, { http: fakeHttp([off]), manifest: real });
    expect(out.results).toHaveLength(19);
    expect(out.notices.filter((n) => n.message.includes('GTA6_MCP_FANDOM_PERMISSION'))).toHaveLength(1);
  });
});
