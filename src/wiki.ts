// MediaWiki client for the two runtime providers. User input only ever travels
// inside API query parameters.
import * as z from 'zod/v4';
import { FANDOM_API, type FailReason, type Http, WIKIPEDIA_API } from './net.js';
import type { Provider } from './schemas.js';
import { stripHtml } from './wikitext.js';

export interface ProviderInfo {
  readonly api: string;
  readonly pageBase: string;
  readonly license: string;
  readonly attribution: string;
}

export const PROVIDERS: Readonly<Record<Provider, ProviderInfo>> = {
  fandom: {
    api: FANDOM_API,
    pageBase: 'https://gta.fandom.com/wiki/',
    license: 'CC BY-SA (see https://www.fandom.com/licensing)',
    attribution: 'GTA Wiki contributors (Fandom). Text extracted and reduced to plain text by gta6-mcp.',
  },
  wikipedia: {
    api: WIKIPEDIA_API,
    pageBase: 'https://en.wikipedia.org/wiki/',
    license: 'CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/)',
    attribution: 'Wikipedia contributors. Text extracted and reduced to plain text by gta6-mcp.',
  },
};

export interface Unavailable {
  readonly kind: 'unavailable';
  readonly reason: FailReason | 'api_error';
  readonly detail: string;
}

export interface PageOk {
  readonly kind: 'ok';
  readonly title: string;
  readonly redirected_from: string | null;
  readonly revid: number;
  readonly wikitext: string;
  readonly url: string;
  readonly retrieved_at: string;
  readonly stale: boolean;
}

export type PageFetch = PageOk | { readonly kind: 'missing' } | Unavailable;

export interface SearchOk {
  readonly kind: 'ok';
  readonly hits: readonly { readonly title: string; readonly snippet: string | null }[];
  readonly retrieved_at: string;
  readonly stale: boolean;
}

export interface CategoriesOk {
  readonly kind: 'ok';
  readonly byTitle: ReadonlyMap<string, readonly string[]>;
}

const ApiError = z.object({ error: z.object({ code: z.string(), info: z.string().optional() }) });
const ParseResponse = z.object({
  parse: z.object({
    title: z.string(),
    revid: z.number(),
    wikitext: z.string(),
    redirects: z.array(z.object({ from: z.string(), to: z.string() })).optional(),
  }),
});
const SearchResponse = z.object({
  query: z.object({ search: z.array(z.object({ title: z.string(), snippet: z.string().optional() })) }),
});
const CategoriesResponse = z.object({
  query: z.object({
    pages: z.array(z.object({ title: z.string(), categories: z.array(z.object({ title: z.string() })).optional() })),
  }),
});

const CATEGORY_PREFIX = 'Category:';
const unavailable = (reason: Unavailable['reason'], detail: string): Unavailable => ({ kind: 'unavailable', reason, detail });

export function pageUrl(provider: Provider, title: string): string {
  return `${PROVIDERS[provider].pageBase}${encodeURIComponent(title.replaceAll(' ', '_'))}`;
}

function apiUrl(provider: Provider, params: Readonly<Record<string, string>>): string {
  return `${PROVIDERS[provider].api}?${new URLSearchParams({ ...params, format: 'json', formatversion: '2' }).toString()}`;
}

export async function fetchPage(http: Http, provider: Provider, title: string): Promise<PageFetch> {
  const res = await http.get(apiUrl(provider, { action: 'parse', page: title, prop: 'wikitext|revid', redirects: '1' }));
  if (!res.ok) return unavailable(res.reason, res.detail);
  const error = ApiError.safeParse(res.json);
  if (error.success) {
    return error.data.error.code === 'missingtitle'
      ? { kind: 'missing' }
      : unavailable('api_error', `API error ${error.data.error.code}`);
  }
  const parsed = ParseResponse.safeParse(res.json);
  if (!parsed.success) return unavailable('api_error', 'unsupported parse response');
  const { parse } = parsed.data;
  return {
    kind: 'ok',
    title: parse.title,
    redirected_from: parse.redirects?.[0]?.from ?? null,
    revid: parse.revid,
    wikitext: parse.wikitext,
    url: pageUrl(provider, parse.title),
    retrieved_at: res.fetched_at,
    stale: res.stale,
  };
}

export async function search(http: Http, provider: Provider, query: string, limit: number): Promise<SearchOk | Unavailable> {
  const res = await http.get(
    apiUrl(provider, { action: 'query', list: 'search', srsearch: query, srlimit: String(limit), srprop: 'snippet' }),
  );
  if (!res.ok) return unavailable(res.reason, res.detail);
  const parsed = SearchResponse.safeParse(res.json);
  if (!parsed.success) return unavailable('api_error', 'unsupported search response');
  const hits = parsed.data.query.search.map((hit) => {
    const snippet = stripHtml(hit.snippet ?? '');
    return { title: hit.title, snippet: snippet === '' ? null : snippet };
  });
  return { kind: 'ok', hits, retrieved_at: res.fetched_at, stale: res.stale };
}

export async function categories(http: Http, provider: Provider, titles: readonly string[]): Promise<CategoriesOk | Unavailable> {
  if (titles.length === 0) return { kind: 'ok', byTitle: new Map() };
  const res = await http.get(apiUrl(provider, { action: 'query', prop: 'categories', cllimit: 'max', titles: titles.join('|') }));
  if (!res.ok) return unavailable(res.reason, res.detail);
  const parsed = CategoriesResponse.safeParse(res.json);
  if (!parsed.success) return unavailable('api_error', 'unsupported categories response');
  const byTitle = new Map(
    parsed.data.query.pages.map((page) => [page.title, (page.categories ?? []).map((c) => c.title.replace(CATEGORY_PREFIX, ''))]),
  );
  return { kind: 'ok', byTitle };
}
