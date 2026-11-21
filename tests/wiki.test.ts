import { describe, expect, it } from 'vitest';
import { MAX_CATEGORY_BATCHES, categories, fetchPage, pageUrl, search } from '../src/wiki.js';
import { FETCHED_AT, down, fakeHttp, fixtureJson, okJson } from './helpers.js';

const SEARCH_LIMIT = 10;
const CHEATS_REVISION = 2089363;
const GTA_V_REVISION = 2082854;

describe('pageUrl', () => {
  it('builds a canonical page link', () => {
    expect(pageUrl('fandom', 'Cheats in GTA VI')).toBe('https://gta.fandom.com/wiki/Cheats_in_GTA_VI');
    expect(pageUrl('wikipedia', 'Grand Theft Auto VI')).toBe('https://en.wikipedia.org/wiki/Grand_Theft_Auto_VI');
  });
});

describe('fetchPage', () => {
  it('returns wikitext, revision and link for a real page', async () => {
    const http = fakeHttp([{ match: ['gta.fandom.com', 'action=parse'], result: okJson(fixtureJson('real/fandom-parse-cheats-gta-vi.json')) }]);
    const page = await fetchPage(http, 'fandom', 'Cheats in GTA VI');
    expect(page).toMatchObject({
      kind: 'ok',
      title: 'Cheats in GTA VI',
      redirected_from: null,
      revid: CHEATS_REVISION,
      url: 'https://gta.fandom.com/wiki/Cheats_in_GTA_VI',
      retrieved_at: FETCHED_AT,
      stale: false,
    });
    expect(page.kind === 'ok' && page.wikitext.includes('Attack Force')).toBe(true);
    expect(http.requests[0]).toContain('page=Cheats in GTA VI');
    expect(http.requests[0]).toContain('redirects=1');
  });

  it('reports the real missingtitle answer as a missing page', async () => {
    const http = fakeHttp([{ match: ['action=parse'], result: okJson(fixtureJson('real/fandom-parse-missingtitle.json')) }]);
    expect(await fetchPage(http, 'fandom', 'Secrets and Easter Eggs in GTA VI')).toEqual({ kind: 'missing' });
  });

  it('reports the real redirect', async () => {
    const http = fakeHttp([{ match: ['action=parse'], result: okJson(fixtureJson('real/fandom-parse-redirect-cheats-gta-5.json')) }]);
    expect(await fetchPage(http, 'fandom', 'Cheats in GTA 5')).toMatchObject({
      kind: 'ok',
      title: 'Cheats in GTA V',
      redirected_from: 'Cheats in GTA 5',
      revid: GTA_V_REVISION,
    });
  });

  it('treats any other API error as unavailable', async () => {
    const http = fakeHttp([{ match: ['action=parse'], result: okJson(fixtureJson('real/fandom-parse-nosuchsection.json')) }]);
    expect(await fetchPage(http, 'fandom', 'Cheats in GTA VI')).toMatchObject({ kind: 'unavailable', reason: 'api_error' });
  });

  it('treats an unexpected JSON shape as unavailable', async () => {
    const http = fakeHttp([{ match: ['action=parse'], result: okJson({ parse: { title: 1 } }) }]);
    expect(await fetchPage(http, 'fandom', 'X')).toMatchObject({ kind: 'unavailable', reason: 'api_error' });
  });

  it('passes a transport failure through', async () => {
    const http = fakeHttp([{ match: ['action=parse'], result: down('challenge') }]);
    expect(await fetchPage(http, 'fandom', 'X')).toMatchObject({ kind: 'unavailable', reason: 'challenge' });
  });

  it('marks a stale cache read', async () => {
    const http = fakeHttp([{ match: ['action=parse'], result: okJson(fixtureJson('real/fandom-parse-cheats-gta-vi.json'), true) }]);
    expect(await fetchPage(http, 'fandom', 'Cheats in GTA VI')).toMatchObject({ kind: 'ok', stale: true });
  });
});

describe('search', () => {
  it('maps real Fandom hits and turns empty snippets into null', async () => {
    const http = fakeHttp([{ match: ['gta.fandom.com', 'list=search'], result: okJson(fixtureJson('real/fandom-search-cheats.json')) }]);
    const result = await search(http, 'fandom', 'GTA VI cheats', SEARCH_LIMIT);
    const [first, second] = result.kind === 'ok' ? result.hits : [];
    expect([first, second]).toEqual([
      { title: 'Cheats in GTA VI', snippet: null },
      { title: 'Cheats in GTA V', snippet: null },
    ]);
    expect(http.requests[0]).toContain('srsearch=GTA VI cheats');
    expect(http.requests[0]).toContain(`srlimit=${SEARCH_LIMIT}`);
  });

  it('strips markup from real Wikipedia snippets', async () => {
    const http = fakeHttp([{ match: ['en.wikipedia.org', 'list=search'], result: okJson(fixtureJson('real/wikipedia-search-gta-vi.json')) }]);
    const result = await search(http, 'wikipedia', 'Leonida', SEARCH_LIMIT);
    const first = result.kind === 'ok' ? result.hits[0] : undefined;
    expect(first?.title).toBe('Grand Theft Auto VI');
    expect(first?.snippet).toContain('Grand Theft Auto VI');
    expect(first?.snippet).not.toContain('<span');
  });

  it('reports a failed provider', async () => {
    const http = fakeHttp([{ match: ['list=search'], result: down() }]);
    expect(await search(http, 'fandom', 'q', SEARCH_LIMIT)).toMatchObject({ kind: 'unavailable', reason: 'timeout' });
  });
});

describe('categories', () => {
  it('maps real category lists by title', async () => {
    const http = fakeHttp([{ match: ['prop=categories'], result: okJson(fixtureJson('real/fandom-categories-search-hits.json')) }]);
    const result = await categories(http, 'fandom', ['Cheats in GTA VI', 'Cheats in GTA V', 'State of Leonida']);
    expect(result.kind === 'ok' && result.byTitle.get('Cheats in GTA VI')).toEqual(['Cheats', 'GTA VI']);
    expect(result.kind === 'ok' && result.byTitle.get('State of Leonida')).toEqual(['Locations in GTA VI', 'States']);
    expect(http.requests[0]).toContain('titles=Cheats in GTA VI|Cheats in GTA V|State of Leonida');
  });

  it('answers an empty title list without a request', async () => {
    const http = fakeHttp([]);
    expect(await categories(http, 'fandom', [])).toMatchObject({ kind: 'ok' });
    expect(http.requests).toHaveLength(0);
  });

  // SYNTHETIC responses: the continuation shape follows the MediaWiki API documentation, not a capture.
  it('follows clcontinue and merges the batches per title', async () => {
    const first = { continue: { clcontinue: '7|Next', continue: '||' }, query: { pages: [{ title: 'Vice Beach', categories: [{ title: 'Category:Beaches' }] }] } };
    const second = { batchcomplete: true, query: { pages: [{ title: 'Vice Beach', categories: [{ title: 'Category:Locations in GTA VI' }] }] } };
    const http = fakeHttp([
      { match: ['prop=categories', 'clcontinue=7|Next', 'continue=||'], result: okJson(second) },
      { match: ['prop=categories'], result: okJson(first) },
    ]);
    const result = await categories(http, 'fandom', ['Vice Beach']);
    expect(result.kind === 'ok' && result.byTitle.get('Vice Beach')).toEqual(['Beaches', 'Locations in GTA VI']);
    expect(http.requests).toHaveLength(2);
  });

  it('stops following continuation at a fixed bound and reports the list as unread, not as complete', async () => {
    const endless = { continue: { clcontinue: '7|Next', continue: '||' }, query: { pages: [{ title: 'Vice Beach', categories: [{ title: 'Category:Beaches' }] }] } };
    const http = fakeHttp([{ match: ['prop=categories'], result: okJson(endless) }]);
    expect(await categories(http, 'fandom', ['Vice Beach'])).toMatchObject({ kind: 'unavailable', reason: 'api_error' });
    expect(http.requests).toHaveLength(MAX_CATEGORY_BATCHES);
  });

  it('says when the categories came from an expired cache entry', async () => {
    const body = { query: { pages: [{ title: 'Vice Beach', categories: [{ title: 'Category:Beaches' }] }] } };
    const stale = await categories(fakeHttp([{ match: ['prop=categories'], result: okJson(body, true) }]), 'fandom', ['Vice Beach']);
    expect(stale).toMatchObject({ kind: 'ok', stale: true, retrieved_at: '2026-11-21T10:19:00.000Z' });
    const fresh = await categories(fakeHttp([{ match: ['prop=categories'], result: okJson(body) }]), 'fandom', ['Vice Beach']);
    expect(fresh).toMatchObject({ kind: 'ok', stale: false });
  });

  it('is unavailable when a later batch fails', async () => {
    const first = { continue: { clcontinue: '7|Next', continue: '||' }, query: { pages: [{ title: 'Vice Beach' }] } };
    const http = fakeHttp([
      { match: ['prop=categories', 'clcontinue='], result: down() },
      { match: ['prop=categories'], result: okJson(first) },
    ]);
    expect(await categories(http, 'fandom', ['Vice Beach'])).toMatchObject({ kind: 'unavailable', reason: 'timeout' });
  });
});
