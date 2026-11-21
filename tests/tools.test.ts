import { describe, expect, it } from 'vitest';
import { loadManifest } from '../src/evidence.js';
import { MAX_PAGE_CHARS } from '../src/schemas.js';
import { type Deps, easterEggs, getPage, listCheats, renderText, searchGta6 } from '../src/tools.js';
import { type Route, down, fakeHttp, fixtureJson, okJson, okText } from './helpers.js';
import { SYN_GUIDE_URL, SYN_QUOTE, SYN_WIKITEXT, synManifest } from './synthetic.js';

const manifest = loadManifest();
const REAL_ROWS = 18;
const SEARCH_LIMIT = 5;
const ONE_HIT = 1;
const LONG_REPEAT = 3000;
const REVISION = 1;

const cheatsPage: Route = { match: ['gta.fandom.com', 'page=Cheats in GTA VI'], result: okJson(fixtureJson('real/fandom-parse-cheats-gta-vi.json')) };
const fandomSearch: Route = { match: ['gta.fandom.com', 'list=search'], result: okJson(fixtureJson('real/fandom-search-cheats.json')) };
const fandomCategories: Route = { match: ['gta.fandom.com', 'prop=categories'], result: okJson(fixtureJson('real/fandom-categories-search-hits.json')) };
const wikipediaSearch: Route = { match: ['en.wikipedia.org', 'list=search'], result: okJson(fixtureJson('real/wikipedia-search-gta-vi.json')) };
const missingPage: Route = { match: ['action=parse'], result: okJson(fixtureJson('real/fandom-parse-missingtitle.json')) };

const real = (routes: readonly Route[]): Deps => ({ http: fakeHttp(routes), manifest });
const page = (title: string, wikitext: string): unknown => ({ parse: { title, revid: REVISION, wikitext } });
const types = (envelope: { notices: readonly { type: string }[] }): string[] => envelope.notices.map((n) => n.type);

describe('search_gta6', () => {
  const routes = [fandomSearch, fandomCategories, wikipediaSearch];

  it('keeps the GTA VI page and drops other games', async () => {
    const out = await searchGta6({ query: 'GTA VI cheats', limit: SEARCH_LIMIT, spoilers: 'full' }, real(routes));
    const titles = out.results.map((r) => r.title);
    expect(out.status).toBe('ok');
    expect(titles[0]).toBe('Cheats in GTA VI');
    expect(titles).not.toContain('Cheats in GTA V');
    expect(titles).not.toContain('Cheats in GTA IV');
    expect(out.results[0]).toMatchObject({ provider: 'fandom', url: 'https://gta.fandom.com/wiki/Cheats_in_GTA_VI', evidence_label: 'wiki_source_reported' });
  });

  it('never returns more than the limit', async () => {
    const out = await searchGta6({ query: 'GTA VI cheats', limit: ONE_HIT, spoilers: 'full' }, real(routes));
    expect(out.results).toHaveLength(ONE_HIT);
  });

  it('withholds unreviewed titles and every snippet in hints mode', async () => {
    const out = await searchGta6({ query: 'GTA VI cheats', limit: SEARCH_LIMIT, spoilers: 'hints' }, real(routes));
    expect(out.results.map((r) => r.title)).toContain('Cheats in GTA VI');
    expect(out.results.map((r) => r.title)).not.toContain('Lucia Caminos');
    expect(out.results.every((r) => r.snippet === null && r.disclosure === 'reviewed')).toBe(true);
    expect(types(out)).toContain('spoiler_withheld');
  });

  it('labels snippets unreviewed in full mode', async () => {
    const out = await searchGta6({ query: 'GTA VI cheats', limit: SEARCH_LIMIT, spoilers: 'full' }, real(routes));
    const lucia = out.results.find((r) => r.title === 'Lucia Caminos');
    expect(lucia).toMatchObject({ provider: 'wikipedia', disclosure: 'unreviewed', evidence_label: 'background' });
    expect(lucia?.snippet).toContain('Grand Theft Auto VI');
  });

  it('drops leak pages even when they are in the GTA VI category', async () => {
    const hits = { query: { search: [{ title: 'Grand Theft Auto VI/Leaks' }, { title: 'Cheats in GTA VI' }] } };
    const out = await searchGta6(
      { query: 'leaks', limit: SEARCH_LIMIT, spoilers: 'full' },
      real([{ match: ['gta.fandom.com', 'list=search'], result: okJson(hits) }, fandomCategories, wikipediaSearch]),
    );
    expect(out.results.some((r) => r.title.toLowerCase().includes('leak'))).toBe(false);
    expect(out.results.map((r) => r.title)).toContain('Cheats in GTA VI');
  });

  it('is partial when one provider fails', async () => {
    const out = await searchGta6({ query: 'q', limit: SEARCH_LIMIT, spoilers: 'full' }, real([{ match: ['gta.fandom.com'], result: down() }, wikipediaSearch]));
    expect(out.status).toBe('partial');
    expect(out.results.length).toBeGreaterThan(0);
    expect(types(out)).toContain('coverage_gap');
  });

  it('is unavailable when both providers fail', async () => {
    const out = await searchGta6({ query: 'q', limit: SEARCH_LIMIT, spoilers: 'full' }, real([{ match: ['api.php'], result: down('challenge') }]));
    expect(out).toMatchObject({ status: 'upstream_unavailable', results: [], sources: [] });
  });

  it('reports no results after a successful empty lookup', async () => {
    const empty = okJson({ query: { search: [] } });
    const out = await searchGta6({ query: 'zzz', limit: SEARCH_LIMIT, spoilers: 'full' }, real([{ match: ['list=search'], result: empty }]));
    expect(out.status).toBe('no_verified_results');
  });
});

describe('get_page', () => {
  it('returns reviewed sections in hints mode and withholds the rest', async () => {
    const out = await getPage({ title: 'Cheats in GTA VI', source: 'fandom', spoilers: 'hints' }, real([cheatsPage]));
    expect(out.status).toBe('ok');
    expect(out.results[0]?.text).toContain('hold L1 + R1');
    expect(out.results[0]?.text).not.toContain('Attack Force');
    expect(out.results[0]).toMatchObject({ title: 'Cheats in GTA VI', review_status: 'reviewed', truncated: false });
    expect(types(out)).toContain('spoiler_withheld');
    expect(out.sources[0]).toMatchObject({ url: 'https://gta.fandom.com/wiki/Cheats_in_GTA_VI', license: expect.stringContaining('CC BY-SA') });
  });

  it('returns the table at discovery level', async () => {
    const out = await getPage({ title: 'Cheats in GTA VI', section: 'Cheats', source: 'fandom', spoilers: 'discovery' }, real([cheatsPage]));
    expect(out.results[0]?.text).toContain('Attack Force');
    expect(out.results[0]?.section).toBe('Cheats');
  });

  it('returns the whole page, labelled, in full mode', async () => {
    const out = await getPage({ title: 'Cheats in GTA VI', source: 'fandom', spoilers: 'full' }, real([cheatsPage]));
    expect(out.results[0]?.text).toContain('Attack Force');
    expect(out.results[0]?.references).toEqual(['https://www.gamespot.com/articles/all-gta-6-cheats-and-how-to-unlock-them/']);
    expect(types(out)).not.toContain('spoiler_withheld');
  });

  it('distinguishes a missing page', async () => {
    const out = await getPage({ title: 'Secrets and Easter Eggs in GTA VI', source: 'fandom', spoilers: 'hints' }, real([missingPage]));
    expect(out).toMatchObject({ status: 'not_found_page', results: [] });
  });

  it('distinguishes a missing section', async () => {
    const out = await getPage({ title: 'Cheats in GTA VI', section: 'Nope', source: 'fandom', spoilers: 'hints' }, real([cheatsPage]));
    expect(out).toMatchObject({ status: 'not_found_section', results: [] });
  });

  it('distinguishes an existing page withheld by policy', async () => {
    const out = await getPage(
      { title: 'State of Leonida', section: 'Geography', source: 'fandom', spoilers: 'hints' },
      real([{ match: ['action=parse'], result: okJson(page('State of Leonida', 'Lead {{VI}}.\n==Geography==\nSwamps.')) }]),
    );
    expect(out).toMatchObject({ status: 'partial', results: [] });
    expect(types(out)).toEqual(['spoiler_withheld']);
  });

  it('follows a redirect and reports the resolved title', async () => {
    const redirected = { parse: { title: 'Cheats in GTA VI', revid: REVISION, wikitext: 'Lead {{VI}}.', redirects: [{ from: 'GTA 6 cheats', to: 'Cheats in GTA VI' }] } };
    const out = await getPage({ title: 'GTA 6 cheats', source: 'fandom', spoilers: 'full' }, real([{ match: ['action=parse'], result: okJson(redirected) }]));
    expect(out.results[0]?.title).toBe('Cheats in GTA VI');
    expect(out.summary).toContain('GTA 6 cheats');
  });

  it('refuses a page that is not about GTA VI', async () => {
    const out = await getPage({ title: 'Cheats in GTA 5', source: 'fandom', spoilers: 'full' }, real([{ match: ['action=parse'], result: okJson(fixtureJson('real/fandom-parse-redirect-cheats-gta-5.json')) }]));
    expect(out).toMatchObject({ status: 'no_verified_results', results: [] });
    expect(types(out)).toContain('coverage_gap');
  });

  it('caps text at 20,000 characters and says so', async () => {
    const long = `Lead {{VI}}.\n==Body==\n${'word '.repeat(MAX_PAGE_CHARS)}`;
    const out = await getPage({ title: 'Big', source: 'fandom', spoilers: 'full' }, real([{ match: ['action=parse'], result: okJson(page('Big', long)) }]));
    expect(out.results[0]?.text).toHaveLength(MAX_PAGE_CHARS);
    expect(out.results[0]?.truncated).toBe(true);
    expect(types(out)).toContain('truncated');
  });

  it('is unavailable when the provider fails', async () => {
    const out = await getPage({ title: 'X', source: 'wikipedia', spoilers: 'full' }, real([{ match: ['action=parse'], result: down('http') }]));
    expect(out.status).toBe('upstream_unavailable');
  });

  it('labels a stale cache read with its original time', async () => {
    const stale = okJson(fixtureJson('real/fandom-parse-cheats-gta-vi.json'), true);
    const out = await getPage({ title: 'Cheats in GTA VI', source: 'fandom', spoilers: 'full' }, real([{ match: ['action=parse'], result: stale }]));
    expect(out.notices.find((n) => n.type === 'stale_cache')?.message).toContain('2026-11-21T10:19:00.000Z');
  });
});

describe('list_cheats', () => {
  it('returns no rows by default because nothing is confirmed', async () => {
    const out = await listCheats({ include_unverified: false, spoilers: 'hints' }, real([cheatsPage]));
    expect(out).toMatchObject({ status: 'no_verified_results', results: [] });
    expect(types(out)).toContain('coverage_gap');
    expect(out.summary).toContain('0 confirmed');
  });

  it('returns every source-reported row, labelled, when asked', async () => {
    const out = await listCheats({ include_unverified: true, spoilers: 'full' }, real([cheatsPage]));
    expect(out.status).toBe('ok');
    expect(out.results).toHaveLength(REAL_ROWS + ONE_HIT);
    expect(out.results.every((r) => r.confidence !== 'confirmed' && r.platform === 'unattributed')).toBe(true);
    expect(out.results[0]).toMatchObject({
      name: '$250,000',
      input: ['Up', 'Right', 'Down', 'Left', 'Up', 'Left', 'Down', 'Right'],
      input_status: 'known',
      input_method: 'd-pad',
      confidence: 'unverified',
      unlock_requirement: 'Finish the story',
      unlock_spoiler_class: 'hints',
      source_page_url: 'https://gta.fandom.com/wiki/Cheats_in_GTA_VI',
    });
    expect(out.results[0]?.entry_steps).toContain('Hold L1 + R1.');
    expect(out.results[0]?.evidence[0]).toMatchObject({ url: 'https://gta.fandom.com/wiki/Cheats_in_GTA_VI', revision_or_fetched_at: '2089363', time_basis: 'revision' });
  });

  it('reports Attack Force as two conflicting variants in one group', async () => {
    const out = await listCheats({ include_unverified: true, spoilers: 'hints' }, real([cheatsPage]));
    const attack = out.results.filter((r) => r.name === 'Attack Force');
    expect(attack.map((r) => r.input?.length)).toEqual(['Down, Up, Left, Right, Down, Down, Up, Down'.split(', ').length, 'Down, Up, Left, Left, Right, Down, Down, Up, Down'.split(', ').length]);
    expect(attack.every((r) => r.confidence === 'conflicting' && r.conflict_group_id === 'cg-attack-force')).toBe(true);
    expect(new Set(attack.map((r) => r.claim_id)).size).toBe(attack.length);
    expect(attack[0]?.evidence.map((e) => e.url)).toEqual([
      'https://www.gamespot.com/articles/all-gta-6-cheats-and-how-to-unlock-them/',
      'https://gta.fandom.com/wiki/Cheats_in_GTA_VI',
    ]);
    expect(attack[1]?.evidence.map((e) => e.url)).toEqual(['https://www.pcgamer.com/games/grand-theft-auto/gta-6-cheats-list/']);
    expect(attack[1]?.evidence[0]?.time_basis).toBe('captured_at');
    expect(types(out)).toContain('conflict');
  });

  it('reports Vehicle Force as unknown rather than guessing', async () => {
    const out = await listCheats({ include_unverified: true, spoilers: 'hints' }, real([cheatsPage]));
    expect(out.results.find((r) => r.name === 'Vehicle Force')).toMatchObject({ input: null, input_status: 'unknown', confidence: 'unverified' });
  });

  it('holds back discovery-level unlock text in hints mode', async () => {
    const hints = await listCheats({ include_unverified: true, spoilers: 'hints' }, real([cheatsPage]));
    const discovery = await listCheats({ include_unverified: true, spoilers: 'discovery' }, real([cheatsPage]));
    expect(hints.results.find((r) => r.name === 'Dollhouse')).toMatchObject({ unlock_requirement: null, unlock_spoiler_class: 'discovery' });
    expect(discovery.results.find((r) => r.name === 'Dollhouse')?.unlock_requirement).toBe('Spend eight hours with your partner');
    expect(types(hints)).toContain('spoiler_withheld');
  });

  it('matches no row for a platform filter and names the gap', async () => {
    const out = await listCheats({ platform: 'ps5', include_unverified: true, spoilers: 'full' }, real([cheatsPage]));
    expect(out).toMatchObject({ status: 'no_verified_results', results: [] });
    expect(out.notices.find((n) => n.type === 'coverage_gap')?.message).toContain('platform');
  });

  it('is unavailable for confirmed-only requests when the wiki cannot be reached', async () => {
    const out = await listCheats({ include_unverified: false, spoilers: 'hints' }, real([{ match: ['action=parse'], result: down() }]));
    expect(out).toMatchObject({ status: 'upstream_unavailable', results: [] });
  });

  it('falls back to its own recorded reports when the wiki cannot be reached', async () => {
    const out = await listCheats({ include_unverified: true, spoilers: 'hints' }, real([{ match: ['action=parse'], result: down() }]));
    expect(out.status).toBe('partial');
    expect(out.results.every((r) => r.confidence === 'conflicting')).toBe(true);
    expect(types(out)).toContain('coverage_gap');
  });

  it('adds a stale notice for a stale page', async () => {
    const stale = okJson(fixtureJson('real/fandom-parse-cheats-gta-vi.json'), true);
    const out = await listCheats({ include_unverified: true, spoilers: 'hints' }, real([{ match: ['action=parse'], result: stale }]));
    expect(types(out)).toContain('stale_cache');
  });
});

describe('list_cheats confirmation path (synthetic manifest)', () => {
  const synPage: Route = { match: ['action=parse'], result: okJson(page('Cheats in GTA VI', SYN_WIKITEXT)) };
  const deps = (guide: Route, staleRoute?: Route): Deps => ({ http: fakeHttp([guide, staleRoute ?? synPage]), manifest: synManifest() });
  const guideOk: Route = { match: [SYN_GUIDE_URL], result: okText(`<p>${SYN_QUOTE}</p>`) };

  it('confirms a row whose reviewed evidence still matches', async () => {
    const out = await listCheats({ include_unverified: false, spoilers: 'full' }, deps(guideOk));
    expect(out.status).toBe('ok');
    expect(out.results).toHaveLength(ONE_HIT);
    expect(out.results[0]).toMatchObject({ name: 'Confirmed Cheat', platform: 'ps5', confidence: 'confirmed', claim_id: 'syn-confirmed-ps5' });
    expect(out.results[0]?.evidence[0]).toMatchObject({ url: SYN_GUIDE_URL, claim_text_reviewed: SYN_QUOTE, time_basis: 'fetched_at' });
  });

  it('honours a platform filter on confirmed rows', async () => {
    const ps5 = await listCheats({ platform: 'ps5', include_unverified: false, spoilers: 'full' }, deps(guideOk));
    const xbox = await listCheats({ platform: 'xbox-series', include_unverified: false, spoilers: 'full' }, deps(guideOk));
    expect(ps5.results).toHaveLength(ONE_HIT);
    expect(xbox.results).toHaveLength(0);
  });

  it('withholds the confirmation when the evidence text changed', async () => {
    const changed: Route = { match: [SYN_GUIDE_URL], result: okText('<p>We have rewritten this guide.</p>') };
    const out = await listCheats({ include_unverified: true, spoilers: 'full' }, deps(changed));
    expect(out.results.find((r) => r.name === 'Confirmed Cheat')).toMatchObject({ confidence: 'unverified' });
    expect(out.results.find((r) => r.name === 'Confirmed Cheat')?.reason).toContain('no longer contains');
  });

  it('withholds the confirmation when the evidence is unreachable', async () => {
    const out = await listCheats({ include_unverified: false, spoilers: 'full' }, deps({ match: [SYN_GUIDE_URL], result: down('challenge') }));
    expect(out.results).toEqual([]);
  });

  it('does not let a stale wiki page renew a confirmation', async () => {
    const stalePage: Route = { match: ['action=parse'], result: okJson(page('Cheats in GTA VI', SYN_WIKITEXT), true) };
    const out = await listCheats({ include_unverified: false, spoilers: 'full' }, deps(guideOk, stalePage));
    expect(out.results).toEqual([]);
  });

  it('reads undiscovered, omitted and template inputs as stated', async () => {
    const out = await listCheats({ include_unverified: true, spoilers: 'full' }, deps(guideOk));
    const status = (name: string): string | undefined => out.results.find((r) => r.name === name)?.input_status;
    expect(status('Undiscovered Cheat')).toBe('undiscovered');
    expect(status('Omitted Cheat')).toBe('unknown');
    expect(status('Template Cheat')).toBe('unknown');
    expect(types(out)).toContain('unresolved_template');
  });
});

describe('easter_eggs', () => {
  it('says plainly that nothing is reviewed and no page exists', async () => {
    const out = await easterEggs({ spoilers: 'hints' }, real([missingPage]));
    expect(out).toMatchObject({ status: 'no_verified_results', results: [] });
    expect(out.notices.find((n) => n.type === 'coverage_gap')?.message).toContain('No reviewed');
  });

  it('is unavailable when the wiki cannot be reached', async () => {
    const out = await easterEggs({ spoilers: 'hints' }, real([{ match: ['action=parse'], result: down() }]));
    expect(out.status).toBe('upstream_unavailable');
  });

  it('returns unreviewed sections as unverified in full mode only', async () => {
    const eggs = okJson(page('Secrets and Easter Eggs in GTA VI', 'Lead {{VI}}.\n==Ghost car==\nSeen near the bridge.\n==UFO==\nOver the swamp.'));
    const routes: Route[] = [{ match: ['page=Secrets and Easter Eggs in GTA VI'], result: eggs }, missingPage];
    const full = await easterEggs({ spoilers: 'full' }, real(routes));
    const hints = await easterEggs({ spoilers: 'hints' }, real(routes));
    const topical = await easterEggs({ topic: 'ufo', spoilers: 'full' }, real(routes));
    expect(full.results.map((r) => r.title)).toEqual(['Ghost car', 'UFO']);
    expect(full.results[0]).toMatchObject({ evidence_status: 'unverified', confidence: 'unverified', hint: null, spoiler_class: 'unclassified' });
    expect(hints).toMatchObject({ status: 'partial', results: [] });
    expect(types(hints)).toContain('spoiler_withheld');
    expect(topical.results.map((r) => r.title)).toEqual(['UFO']);
  });
});

describe('renderText', () => {
  it('is built from the envelope and nothing else', async () => {
    const out = await listCheats({ include_unverified: true, spoilers: 'hints' }, real([cheatsPage]));
    const text = renderText(out);
    expect(text).toContain(out.summary);
    expect(text).toContain('Attack Force');
    expect(text).toContain('conflicting');
    expect(text).toContain('https://gta.fandom.com/wiki/Cheats_in_GTA_VI');
    expect(text).not.toContain('Spend eight hours with your partner');
    expect(text.length).toBeLessThan(MAX_PAGE_CHARS + LONG_REPEAT);
  });
});
