import { readFileSync } from 'node:fs';
import type { GetOptions, Http, HttpResult } from '../src/net.js';

export const FETCHED_AT = '2026-11-21T10:19:00.000Z';

export function fixtureText(path: string): string {
  return readFileSync(`tests/fixtures/${path}`, 'utf8');
}

export function fixtureJson(path: string): unknown {
  return JSON.parse(fixtureText(path)) as unknown;
}

export interface Route {
  /** Every fragment must appear in the decoded request URL. */
  readonly match: readonly string[];
  readonly result: HttpResult | (() => HttpResult);
}

export function okJson(json: unknown, stale = false): HttpResult {
  return { ok: true, body: JSON.stringify(json), json, fetched_at: FETCHED_AT, stale };
}

export function okText(body: string): HttpResult {
  return { ok: true, body, json: null, fetched_at: FETCHED_AT, stale: false };
}

export function down(reason: 'timeout' | 'http' | 'challenge' = 'timeout'): HttpResult {
  return { ok: false, reason, detail: 'simulated' };
}

export interface FakeHttp extends Http {
  readonly requests: string[];
}

/** Routes are tried in order; an unrouted request fails the way a blocked one does. */
export function fakeHttp(routes: readonly Route[]): FakeHttp {
  const requests: string[] = [];
  return {
    requests,
    async get(url: string, _opts?: GetOptions): Promise<HttpResult> {
      const decoded = decodeURIComponent(url.replaceAll('+', ' '));
      requests.push(decoded);
      const route = routes.find((r) => r.match.every((fragment) => decoded.includes(fragment)));
      if (!route) return { ok: false, reason: 'blocked', detail: `no route for ${decoded}` };
      return typeof route.result === 'function' ? route.result() : route.result;
    },
  };
}
