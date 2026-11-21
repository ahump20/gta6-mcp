import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { type Http, type HttpResult, createHttp, fandomPermittedBy, isAllowed } from '../src/net.js';
import { fetchPage } from '../src/wiki.js';

const FANDOM = 'https://gta.fandom.com/api.php?action=query&format=json';
const FANDOM_B = 'https://gta.fandom.com/api.php?action=parse&format=json';
const WIKIPEDIA = 'https://en.wikipedia.org/w/api.php?action=query&format=json';
const GUIDE = 'https://www.pcgamer.com/games/grand-theft-auto/gta-6-cheats-list/';
const NONE: ReadonlySet<string> = new Set();
const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };
const HTTP_OK = 200;
const HTTP_FOUND = 302;
const HTTP_FORBIDDEN = 403;
const HTTP_TOO_MANY = 429;
const ONE_SECOND_MS = 1000;
const TWO_SECONDS_MS = 2000;
const FIVE_SECONDS_MS = 5000;
const OVER_AN_HOUR_MS = 3_700_000;
const OVER_CAP_BYTES = 2_100_000;
const MAX_REDIRECT_FETCHES = 4;
const MAX_ATTEMPTS = 3;

type Responder = (url: string, call: number) => Response | Promise<Response>;

interface Rig {
  readonly http: Http;
  readonly calls: string[];
  readonly sleeps: number[];
  advance(ms: number): void;
}

function rig(responder: Responder, exactUrls: ReadonlySet<string> = NONE, fandomPermitted = true): Rig {
  let t = 0;
  const calls: string[] = [];
  const sleeps: number[] = [];
  const http = createHttp({
    fetch: async (input: string | URL | Request): Promise<Response> => {
      const url = String(input);
      calls.push(url);
      return responder(url, calls.length);
    },
    now: (): number => t,
    sleep: async (ms: number): Promise<void> => {
      sleeps.push(ms);
      t += ms;
    },
    exactUrls,
    fandomPermitted,
  });
  return {
    http,
    calls,
    sleeps,
    advance: (ms: number): void => {
      t += ms;
    },
  };
}

const json = (body: unknown, status = HTTP_OK, headers: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...headers } });

function reasonOf(result: HttpResult): string {
  return result.ok ? 'ok' : result.reason;
}

describe('isAllowed', () => {
  it('accepts the two wiki API endpoints', () => {
    expect(isAllowed(FANDOM, NONE)).toBe(true);
    expect(isAllowed(WIKIPEDIA, NONE)).toBe(true);
  });

  it.each([
    ['plain http', 'http://gta.fandom.com/api.php?action=query'],
    ['a non-default port', 'https://gta.fandom.com:8443/api.php?action=query'],
    ['userinfo', 'https://user:pw@gta.fandom.com/api.php?action=query'],
    ['a look-alike host', 'https://gta.fandom.com.evil.test/api.php?action=query'],
    ['another fandom wiki', 'https://gtax.fandom.com/api.php?action=query'],
    ['a non-API path', 'https://gta.fandom.com/wiki/Cheats_in_GTA_VI'],
    ['an unlisted guide URL', GUIDE],
    ['garbage', 'not a url'],
  ])('refuses %s', (_label, url) => {
    expect(isAllowed(url, NONE)).toBe(false);
  });

  it('accepts a guide URL only when it is listed exactly', () => {
    const listed = new Set([GUIDE]);
    expect(isAllowed(GUIDE, listed)).toBe(true);
    expect(isAllowed(`${GUIDE}?page=2`, listed)).toBe(false);
  });
});

describe('createHttp', () => {
  it('returns parsed JSON with the fetch time', async () => {
    const r = rig(() => json({ a: 1 }));
    const result = await r.http.get(FANDOM);
    expect(result).toMatchObject({ ok: true, json: { a: 1 }, stale: false, fetched_at: '1970-01-01T00:00:00.000Z' });
  });

  it('refuses a disallowed URL without calling fetch', async () => {
    const r = rig(() => json({}));
    expect(reasonOf(await r.http.get(GUIDE))).toBe('blocked');
    expect(r.calls).toHaveLength(0);
  });

  it('refuses a redirect to another host', async () => {
    const r = rig(() => new Response(null, { status: HTTP_FOUND, headers: { location: 'https://evil.test/api.php' } }));
    expect(reasonOf(await r.http.get(FANDOM))).toBe('blocked');
    expect(r.calls).toHaveLength(1);
  });

  it('stops after three redirects', async () => {
    const r = rig((_url, call) => new Response(null, { status: HTTP_FOUND, headers: { location: `${FANDOM}&hop=${call}` } }));
    expect(reasonOf(await r.http.get(FANDOM))).toBe('blocked');
    expect(r.calls).toHaveLength(MAX_REDIRECT_FETCHES);
  });

  it('follows an allowed redirect', async () => {
    const r = rig((_url, call) => (call === 1 ? new Response(null, { status: HTTP_FOUND, headers: { location: FANDOM_B } }) : json({ ok: 1 })));
    expect(await r.http.get(FANDOM)).toMatchObject({ ok: true, json: { ok: 1 } });
  });

  it('treats the real GameSpot 403 challenge as an HTTP failure', async () => {
    const body = readFileSync('tests/fixtures/real/gamespot-403-challenge.html', 'utf8');
    const r = rig(() => new Response(body, { status: HTTP_FORBIDDEN, headers: { 'content-type': 'text/html; charset=UTF-8' } }));
    expect(reasonOf(await r.http.get(FANDOM))).toBe('http');
  });

  it('treats HTML on HTTP 200 as a challenge', async () => {
    const r = rig(() => new Response('<html><title>Just a moment...</title></html>', { status: HTTP_OK, headers: { 'content-type': 'text/html' } }));
    expect(reasonOf(await r.http.get(FANDOM))).toBe('challenge');
  });

  it('reports invalid JSON', async () => {
    const r = rig(() => new Response('{"a":', { status: HTTP_OK, headers: JSON_HEADERS }));
    expect(reasonOf(await r.http.get(FANDOM))).toBe('invalid_json');
  });

  it('reports a body over the cap', async () => {
    const r = rig(() => new Response('x'.repeat(OVER_CAP_BYTES), { status: HTTP_OK, headers: JSON_HEADERS }));
    expect(reasonOf(await r.http.get(FANDOM))).toBe('too_large');
  });

  it('reports a timeout', async () => {
    const r = rig(() => {
      throw new DOMException('timed out', 'TimeoutError');
    });
    expect(reasonOf(await r.http.get(FANDOM))).toBe('timeout');
  });

  it('reports a network failure', async () => {
    const r = rig(() => {
      throw new TypeError('fetch failed');
    });
    expect(reasonOf(await r.http.get(FANDOM))).toBe('network');
  });

  it('shares one upstream request between concurrent callers', async () => {
    const r = rig(() => json({ a: 1 }));
    const [a, b] = await Promise.all([r.http.get(FANDOM), r.http.get(FANDOM)]);
    expect(a.ok && b.ok).toBe(true);
    expect(r.calls).toHaveLength(1);
  });

  it('serves a repeat call from cache inside an hour', async () => {
    const r = rig(() => json({ a: 1 }));
    await r.http.get(FANDOM);
    r.advance(ONE_SECOND_MS);
    const again = await r.http.get(FANDOM);
    expect(again).toMatchObject({ ok: true, stale: false, fetched_at: '1970-01-01T00:00:00.000Z' });
    expect(r.calls).toHaveLength(1);
  });

  it('does not cache failures', async () => {
    const r = rig((_url, call) => (call === 1 ? new Response('nope', { status: HTTP_FORBIDDEN }) : json({ a: 1 })));
    expect(reasonOf(await r.http.get(FANDOM))).toBe('http');
    expect(reasonOf(await r.http.get(FANDOM))).toBe('ok');
  });

  it('returns the expired entry labelled stale when the refresh fails', async () => {
    const r = rig((_url, call) => (call === 1 ? json({ a: 1 }) : new Response('down', { status: HTTP_FORBIDDEN })));
    await r.http.get(FANDOM);
    r.advance(OVER_AN_HOUR_MS);
    const result = await r.http.get(FANDOM);
    expect(result).toMatchObject({ ok: true, stale: true, fetched_at: '1970-01-01T00:00:00.000Z', json: { a: 1 } });
  });

  it('never falls back to a stale entry for a fresh read', async () => {
    const r = rig((_url, call) => (call === 1 ? json({ a: 1 }) : new Response('down', { status: HTTP_FORBIDDEN })));
    await r.http.get(FANDOM);
    r.advance(OVER_AN_HOUR_MS);
    expect(reasonOf(await r.http.get(FANDOM, { fresh: true }))).toBe('http');
  });

  it('spaces requests to one host a second apart', async () => {
    const r = rig(() => json({}));
    await r.http.get(FANDOM);
    await r.http.get(FANDOM_B);
    expect(r.sleeps).toEqual([ONE_SECOND_MS]);
  });

  it('does not make one host wait for another', async () => {
    const r = rig(() => json({}));
    await r.http.get(FANDOM);
    await r.http.get(WIKIPEDIA);
    expect(r.sleeps).toEqual([]);
  });

  it('retries a 429 after Retry-After', async () => {
    const r = rig((_url, call) => (call === 1 ? json({}, HTTP_TOO_MANY, { 'retry-after': '2' }) : json({ a: 1 })));
    expect(reasonOf(await r.http.get(FANDOM))).toBe('ok');
    expect(r.sleeps).toEqual([TWO_SECONDS_MS]);
  });

  it('caps Retry-After at five seconds and stops after two retries', async () => {
    const r = rig(() => json({}, HTTP_TOO_MANY, { 'retry-after': '600' }));
    expect(reasonOf(await r.http.get(FANDOM))).toBe('rate_limited');
    expect(r.calls).toHaveLength(MAX_ATTEMPTS);
    expect(r.sleeps).toEqual([FIVE_SECONDS_MS, FIVE_SECONDS_MS]);
  });

  it('reads an exact guide URL as text', async () => {
    const r = rig(() => new Response('<html>guide</html>', { status: HTTP_OK, headers: { 'content-type': 'text/html' } }), new Set([GUIDE]));
    expect(await r.http.get(GUIDE, { expect: 'text' })).toMatchObject({ ok: true, body: '<html>guide</html>' });
  });

  it('sends the project User-Agent', async () => {
    let seen = '';
    const http = createHttp({
      fetch: async (_input: string | URL | Request, init?: RequestInit): Promise<Response> => {
        seen = new Headers(init?.headers).get('user-agent') ?? '';
        return json({});
      },
      now: (): number => 0,
      sleep: async (): Promise<void> => {},
      exactUrls: NONE,
      fandomPermitted: true,
    });
    await http.get(FANDOM);
    expect(seen).toBe('gta6-mcp/0.1 (+https://github.com/ahump20/gta6-mcp)');
  });
});

describe('Fandom permission gate', () => {
  it('makes no Fandom request unless permission is recorded', async () => {
    const r = rig(() => json({ ok: true }), NONE, false);
    const refused = await r.http.get(FANDOM);
    expect(refused).toMatchObject({ ok: false, reason: 'not_permitted' });
    expect(r.calls).toEqual([]);
    expect((await r.http.get(WIKIPEDIA)).ok).toBe(true);
  });

  it('reads permission only from the exact setting', () => {
    expect(fandomPermittedBy({})).toBe(false);
    expect(fandomPermittedBy({ GTA6_MCP_FANDOM_PERMISSION: '1' })).toBe(false);
    expect(fandomPermittedBy({ GTA6_MCP_FANDOM_PERMISSION: 'granted' })).toBe(true);
  });
});

describe('robustness fixes', () => {
  const READ_ONLY = { error: { code: 'readonly', info: 'The wiki is currently in read-only mode.' } };
  const THREE_SECONDS_MS = 3000;
  const TEN_SECONDS_MS = 10_000;
  const TEN_MINUTES_MS = 600_000;
  const HTTP_UNAVAILABLE = 503;
  const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

  it('treats a MediaWiki error body on HTTP 200 as a failure', async () => {
    const r = rig(() => json(READ_ONLY));
    expect(await r.http.get(FANDOM)).toEqual({ ok: false, reason: 'api_error', detail: 'API error readonly' });
  });

  it('never caches a MediaWiki error body', async () => {
    const r = rig((_url, call) => (call === 1 ? json(READ_ONLY) : json({ a: 1 })));
    expect(reasonOf(await r.http.get(FANDOM))).toBe('api_error');
    expect(await r.http.get(FANDOM)).toMatchObject({ ok: true, json: { a: 1 } });
  });

  it('keeps the good cached copy through a read-only window', async () => {
    const r = rig((_url, call) => (call === 1 ? json({ a: 1 }) : json(READ_ONLY)));
    await r.http.get(FANDOM);
    r.advance(OVER_AN_HOUR_MS);
    expect(await r.http.get(FANDOM)).toMatchObject({ ok: true, stale: true, json: { a: 1 } });
    expect(await r.http.get(FANDOM)).toMatchObject({ ok: true, stale: true, json: { a: 1 } });
  });

  it('still answers a missing page as missing through the real client', async () => {
    const r = rig(() => json({ error: { code: 'missingtitle', info: "The page you specified doesn't exist." } }));
    expect(await fetchPage(r.http, 'fandom', 'Nope')).toEqual({ kind: 'missing' });
  });

  it('reports a read-only wiki as unavailable through the real client', async () => {
    const r = rig(() => json(READ_ONLY));
    expect(await fetchPage(r.http, 'fandom', 'Cheats in GTA VI')).toEqual({ kind: 'unavailable', reason: 'api_error', detail: 'API error readonly' });
  });

  it('never serves a text entry to a json read', async () => {
    const r = rig(() => json({ a: 1 }), new Set([GUIDE]));
    expect(await r.http.get(GUIDE, { expect: 'text' })).toMatchObject({ ok: true, json: null });
    expect(await r.http.get(GUIDE)).toMatchObject({ ok: true, json: { a: 1 } });
    expect(r.calls).toHaveLength(2);
  });

  it('never serves a json entry to a text read', async () => {
    const r = rig(() => json({ a: 1 }), new Set([GUIDE]));
    expect(await r.http.get(GUIDE)).toMatchObject({ ok: true, json: { a: 1 } });
    expect(await r.http.get(GUIDE, { expect: 'text' })).toMatchObject({ ok: true, body: '{"a":1}', json: null });
    expect(r.calls).toHaveLength(2);
  });

  it('reports a redirect with an unparseable location as an HTTP failure', async () => {
    const r = rig(() => new Response(null, { status: HTTP_FOUND, headers: { location: 'https://[bad' } }));
    expect(await r.http.get(FANDOM)).toMatchObject({ ok: false, reason: 'http' });
    expect(r.calls).toHaveLength(1);
  });

  it('honours Retry-After given as an HTTP date', async () => {
    const at = new Date(THREE_SECONDS_MS).toUTCString();
    const r = rig((_url, call) => (call === 1 ? json({}, HTTP_TOO_MANY, { 'retry-after': at }) : json({ a: 1 })));
    expect(reasonOf(await r.http.get(FANDOM))).toBe('ok');
    expect(r.sleeps).toEqual([THREE_SECONDS_MS]);
  });

  it('caps a far-off Retry-After date at five seconds', async () => {
    const at = new Date(TEN_MINUTES_MS).toUTCString();
    const r = rig((_url, call) => (call === 1 ? json({}, HTTP_TOO_MANY, { 'retry-after': at }) : json({ a: 1 })));
    await r.http.get(FANDOM);
    expect(r.sleeps).toEqual([FIVE_SECONDS_MS]);
  });

  it.each([
    ['an unparseable value', 'soon'],
    ['a date already past', new Date(THREE_SECONDS_MS).toUTCString()],
  ])('falls back to the default wait for %s', async (_label, header) => {
    const r = rig((_url, call) => (call === 1 ? json({}, HTTP_TOO_MANY, { 'retry-after': header }) : json({ a: 1 })));
    r.advance(TEN_SECONDS_MS);
    await r.http.get(FANDOM);
    expect(r.sleeps).toEqual([ONE_SECOND_MS]);
  });

  describe('unread bodies', () => {
    interface Tracked {
      readonly responder: (status: number, headers?: Record<string, string>) => Response;
      readonly cancelled: () => number;
    }
    const tracked = (): Tracked => {
      let count = 0;
      return {
        responder: (status, headers = {}) =>
          new Response(
            new ReadableStream({
              cancel(): void {
                count += 1;
              },
            }),
            { status, headers },
          ),
        cancelled: () => count,
      };
    };

    it.each<[string, (t: Tracked) => Responder, number]>([
      ['a redirect hop', (t) => (_url, call) => (call === 1 ? t.responder(HTTP_FOUND, { location: FANDOM_B }) : json({})), 1],
      ['every hop of a redirect loop', (t) => (_url, call) => t.responder(HTTP_FOUND, { location: `${FANDOM}&hop=${call}` }), MAX_REDIRECT_FETCHES],
      ['a redirect without a location', (t) => () => t.responder(HTTP_FOUND), 1],
      ['a redirect with a bad location', (t) => () => t.responder(HTTP_FOUND, { location: 'https://[bad' }), 1],
      ['a retried 429', (t) => (_url, call) => (call === 1 ? t.responder(HTTP_TOO_MANY) : json({})), 1],
      ['every 503 of an exhausted retry', (t) => () => t.responder(HTTP_UNAVAILABLE), MAX_ATTEMPTS],
      ['a non-OK response', (t) => () => t.responder(HTTP_FORBIDDEN), 1],
      ['a 200 of the wrong content type', (t) => () => t.responder(HTTP_OK, { 'content-type': 'text/html' }), 1],
    ])('cancels the body of %s', async (_label, build, expected) => {
      const t = tracked();
      await rig(build(t)).http.get(FANDOM);
      await tick();
      expect(t.cancelled()).toBe(expected);
    });

    it('does not throw when a body cannot be cancelled', async () => {
      const broken = (): Response =>
        new Response(
          new ReadableStream({
            cancel(): void {
              throw new Error('cancel failed');
            },
          }),
          { status: HTTP_FORBIDDEN },
        );
      expect(reasonOf(await rig(broken).http.get(FANDOM))).toBe('http');
      await tick();
    });
  });
});
