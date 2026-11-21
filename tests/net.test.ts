import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { type Http, type HttpResult, createHttp, isAllowed } from '../src/net.js';

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

function rig(responder: Responder, exactUrls: ReadonlySet<string> = NONE): Rig {
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
    });
    await http.get(FANDOM);
    expect(seen).toBe('gta6-mcp/0.1 (+https://github.com/ahump20/gta6-mcp)');
  });
});
