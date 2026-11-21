// The only module that touches the network. Every request and redirect hop is
// checked against the allow-list before it is sent.

export const USER_AGENT = 'gta6-mcp/0.1 (+https://github.com/ahump20/gta6-mcp)';
export const FANDOM_API = 'https://gta.fandom.com/api.php';
export const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';

const API_ENDPOINTS: ReadonlySet<string> = new Set([FANDOM_API, WIKIPEDIA_API]);
const TIMEOUT_MS = 10_000;
const API_BYTE_CAP = 2_000_000;
// PC Gamer's guide page was 1.89 MB when verified; see docs/VERIFICATION.md.
const GUIDE_BYTE_CAP = 3_000_000;
const MAX_REDIRECTS = 3;
const MAX_RETRIES = 2;
const RETRY_AFTER_CAP_MS = 5000;
const DEFAULT_RETRY_MS = 1000;
const HOST_SPACING_MS = 1000;
const CACHE_TTL_MS = 3_600_000;
const CACHE_MAX_ENTRIES = 200;
const MS_PER_SECOND = 1000;
const HTTP_OK_MIN = 200;
const HTTP_REDIRECT_MIN = 300;
const HTTP_CLIENT_ERROR_MIN = 400;
const HTTP_TOO_MANY_REQUESTS = 429;
const HTTP_UNAVAILABLE = 503;

export type FailReason =
  | 'blocked'
  | 'not_permitted'
  | 'timeout'
  | 'http'
  | 'rate_limited'
  | 'challenge'
  | 'invalid_json'
  | 'api_error'
  | 'too_large'
  | 'network';

export interface HttpSuccess {
  readonly ok: true;
  readonly body: string;
  readonly json: unknown;
  readonly fetched_at: string;
  readonly stale: boolean;
}

export interface HttpFailure {
  readonly ok: false;
  readonly reason: FailReason;
  readonly detail: string;
}

export type HttpResult = HttpSuccess | HttpFailure;

export interface GetOptions {
  readonly expect?: 'json' | 'text';
  /** Skip the cache and never fall back to a stale entry. */
  readonly fresh?: boolean;
}

export interface Http {
  get(url: string, opts?: GetOptions): Promise<HttpResult>;
}

export interface HttpDeps {
  readonly fetch: (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
  readonly now: () => number;
  readonly sleep: (ms: number) => Promise<void>;
  readonly exactUrls: ReadonlySet<string>;
  /** True only when the operator has recorded Fandom's written permission for automated access. */
  readonly fandomPermitted: boolean;
}

interface CacheEntry {
  readonly body: string;
  readonly json: unknown;
  readonly at: number;
}

const fail = (reason: FailReason, detail: string): HttpFailure => ({ ok: false, reason, detail });

export const FANDOM_PERMISSION_ENV = 'GTA6_MCP_FANDOM_PERMISSION';

/** Fandom's Terms of Use bar automated access without express written permission; this setting records that it was given. */
export function fandomPermittedBy(env: Readonly<Record<string, string | undefined>>): boolean {
  return env[FANDOM_PERMISSION_ENV] === 'granted';
}

export function isAllowed(raw: string, exactUrls: ReadonlySet<string>): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:' || url.port !== '' || url.username !== '' || url.password !== '') return false;
  return API_ENDPOINTS.has(`${url.origin}${url.pathname}`) || exactUrls.has(url.href);
}

/** MediaWiki's answer for a page that does not exist: a result to keep, not an outage. */
export const MISSING_TITLE = 'missingtitle';

// MediaWiki reports failures such as a read-only window as HTTP 200 with a top-level error object.
function apiErrorCode(json: unknown): string | null {
  if (typeof json !== 'object' || json === null || !('error' in json)) return null;
  const { error } = json;
  if (typeof error !== 'object' || error === null) return null;
  return 'code' in error && typeof error.code === 'string' ? error.code : 'unknown';
}

// Releases a body that will not be read; a failure to cancel must never surface.
async function discard(res: Response): Promise<void> {
  try {
    await res.body?.cancel();
  } catch {
    // Nothing to release.
  }
}

async function readCapped(res: Response, cap: number): Promise<string | null> {
  if (!res.body) return '';
  const reader = res.body.getReader();
  const pump = async (chunks: readonly Uint8Array[], total: number): Promise<string | null> => {
    const { done, value } = await reader.read();
    if (done) return Buffer.concat(chunks).toString('utf8');
    if (total + value.byteLength > cap) {
      await reader.cancel();
      return null;
    }
    return pump([...chunks, value], total + value.byteLength);
  };
  return pump([], 0);
}

// Retry-After is either delta-seconds or an HTTP date.
function retryDelayMs(res: Response, now: number): number {
  const header = res.headers.get('retry-after') ?? '';
  const seconds = Number(header);
  const ms = Number.isFinite(seconds) ? seconds * MS_PER_SECOND : Date.parse(header) - now;
  return Math.min(ms > 0 ? ms : DEFAULT_RETRY_MS, RETRY_AFTER_CAP_MS);
}

export function createHttp(deps: HttpDeps): Http {
  const cache = new Map<string, CacheEntry>();
  const inFlight = new Map<string, Promise<HttpResult>>();
  const hostQueue = new Map<string, Promise<void>>();
  const hostLastStart = new Map<string, number>();

  const iso = (ms: number): string => new Date(ms).toISOString();
  const fandomHost = new URL(FANDOM_API).host;

  // Refused before any network call: off the allow-list, or Fandom without recorded permission.
  function refusal(url: string): HttpFailure | null {
    if (!isAllowed(url, deps.exactUrls)) return fail('blocked', 'URL is not on the allow-list');
    if (new URL(url).host === fandomHost && !deps.fandomPermitted) return fail('not_permitted', `${FANDOM_PERMISSION_ENV} is not set to granted`);
    return null;
  }

  // Serialises requests per host and keeps them HOST_SPACING_MS apart.
  async function send(url: string): Promise<Response> {
    const host = new URL(url).host;
    const previous = hostQueue.get(host) ?? Promise.resolve();
    let release: () => void = () => {};
    hostQueue.set(host, new Promise<void>((resolve) => (release = resolve)));
    await previous;
    try {
      const last = hostLastStart.get(host);
      if (last !== undefined) {
        const wait = last + HOST_SPACING_MS - deps.now();
        if (wait > 0) await deps.sleep(wait);
      }
      hostLastStart.set(host, deps.now());
      return await deps.fetch(url, {
        redirect: 'manual',
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json, text/html;q=0.5' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } finally {
      release();
    }
  }

  async function readBody(res: Response, expect: 'json' | 'text'): Promise<HttpResult> {
    const type = res.headers.get('content-type') ?? '';
    if (expect === 'json' && !type.includes('json')) {
      void discard(res);
      return fail('challenge', `unexpected content type ${type}`);
    }
    let body: string | null;
    try {
      body = await readCapped(res, expect === 'json' ? API_BYTE_CAP : GUIDE_BYTE_CAP);
    } catch (error) {
      // Headers arrived but the body stalled or broke: a failure result, so callers can fall back to a cached copy.
      return fail(error instanceof Error && error.name === 'TimeoutError' ? 'timeout' : 'network', 'response body could not be read');
    }
    if (body === null) return fail('too_large', 'response exceeded the size cap');
    if (expect === 'text') return { ok: true, body, json: null, fetched_at: iso(deps.now()), stale: false };
    let json: unknown;
    try {
      json = JSON.parse(body) as unknown;
    } catch {
      return fail('invalid_json', 'response was not valid JSON');
    }
    const code = apiErrorCode(json);
    if (code !== null && code !== MISSING_TITLE) return fail('api_error', `API error ${code}`);
    return { ok: true, body, json, fetched_at: iso(deps.now()), stale: false };
  }

  // One attempt; redirects and retries recurse with their counters.
  async function fetchOnce(url: string, expect: 'json' | 'text', retries = 0, hops = 0): Promise<HttpResult> {
    const refused = refusal(url);
    if (refused) return refused;
    let res: Response;
    try {
      res = await send(url);
    } catch (error) {
      const name = error instanceof Error ? error.name : '';
      return name === 'TimeoutError' || name === 'AbortError'
        ? fail('timeout', `no response within ${TIMEOUT_MS} ms`)
        : fail('network', error instanceof Error ? error.message : 'request failed');
    }
    if (res.status >= HTTP_REDIRECT_MIN && res.status < HTTP_CLIENT_ERROR_MIN) {
      void discard(res);
      const location = res.headers.get('location');
      if (!location) return fail('http', `HTTP ${res.status} without a location`);
      if (hops >= MAX_REDIRECTS) return fail('blocked', 'too many redirects');
      let next: string;
      try {
        next = new URL(location, url).href;
      } catch {
        return fail('http', `HTTP ${res.status} with an invalid location`);
      }
      return fetchOnce(next, expect, retries, hops + 1);
    }
    if (res.status === HTTP_TOO_MANY_REQUESTS || res.status === HTTP_UNAVAILABLE) {
      void discard(res);
      if (retries >= MAX_RETRIES) {
        return fail(res.status === HTTP_TOO_MANY_REQUESTS ? 'rate_limited' : 'http', `HTTP ${res.status}`);
      }
      await deps.sleep(retryDelayMs(res, deps.now()));
      return fetchOnce(url, expect, retries + 1, hops);
    }
    if (res.status < HTTP_OK_MIN || res.status >= HTTP_REDIRECT_MIN) {
      void discard(res);
      return fail('http', `HTTP ${res.status}`);
    }
    return readBody(res, expect);
  }

  async function load(url: string, opts: GetOptions): Promise<HttpResult> {
    const expect = opts.expect ?? 'json';
    // A json read and a text read of one URL are different entries.
    const key = `${expect}:${url}`;
    const cached = cache.get(key);
    const age = cached ? deps.now() - cached.at : Infinity;
    if (cached && !opts.fresh && age < CACHE_TTL_MS) {
      return { ok: true, body: cached.body, json: cached.json, fetched_at: iso(cached.at), stale: false };
    }
    const result = await fetchOnce(url, expect);
    if (result.ok) {
      cache.delete(key);
      cache.set(key, { body: result.body, json: result.json, at: deps.now() });
      const oldest = cache.keys().next();
      if (cache.size > CACHE_MAX_ENTRIES && !oldest.done) cache.delete(oldest.value);
      return result;
    }
    if (cached && !opts.fresh && result.reason !== 'blocked') {
      return { ok: true, body: cached.body, json: cached.json, fetched_at: iso(cached.at), stale: true };
    }
    return result;
  }

  return {
    async get(url: string, opts: GetOptions = {}): Promise<HttpResult> {
      const refused = refusal(url);
    if (refused) return refused;
      const key = `${opts.fresh ? 'fresh' : 'cached'}:${opts.expect ?? 'json'}:${url}`;
      const running = inFlight.get(key);
      if (running) return running;
      const request = load(url, opts);
      inFlight.set(key, request);
      try {
        return await request;
      } finally {
        inFlight.delete(key);
      }
    },
  };
}
