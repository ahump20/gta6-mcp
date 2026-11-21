// Every marker below sits in SYNTHETIC source content that no review covers.
// In hints and discovery modes none of them may appear in any serialised field.
import { describe, expect, it } from 'vitest';
import { fingerprint } from '../src/evidence.js';
import type { Envelope } from '../src/schemas.js';
import { type Deps, easterEggs, getPage, listCheats, renderText, searchGta6 } from '../src/tools.js';
import { parseCheatTable } from '../src/wikitext.js';
import { type FakeHttp, type Route, fakeHttp, okJson } from './helpers.js';
import { SYN_WIKITEXT, synManifest } from './synthetic.js';

const MARKERS = ['LEADMARKER7Q', 'STEPSMARKER7Q', 'UNLOCKMARKER7Q', 'TEMPLATEMARKER7Q', 'ROWMARKER7Q', 'BODYMARKER7Q', 'LOCATIONMARKER7Q', 'TITLEMARKER7Q'];
const SEARCH_LIMIT = 10;
const REVISION = 1;
const WITHHELD = 'Content withheld by spoiler policy.';

const rows = parseCheatTable(SYN_WIKITEXT);
const rowPrint = (name: string): string => fingerprint(rows.find((r) => r.name === name)?.row_text ?? '');
const base = synManifest();
const manifest = synManifest({
  confirmations: [],
  spoiler_registry: {
    ...base.spoiler_registry,
    cheat_rows: [
      { name: 'Confirmed Cheat', row_fingerprint: rowPrint('Confirmed Cheat'), min_level: 'hints', unlock_min_level: 'full' },
      { name: 'Template Cheat', row_fingerprint: rowPrint('Template Cheat'), min_level: 'hints', unlock_min_level: 'hints' },
    ],
  },
});

const parse = (title: string): unknown => ({ parse: { title, revid: REVISION, wikitext: SYN_WIKITEXT } });
const routes: readonly Route[] = [
  { match: ['list=search', 'gta.fandom.com'], result: okJson({ query: { search: [{ title: 'Cheats in GTA VI' }, { title: 'Secret TITLEMARKER7Q ending' }] } }) },
  { match: ['prop=categories'], result: okJson({ query: { pages: [{ title: 'Cheats in GTA VI', categories: [{ title: 'Category:GTA VI' }] }, { title: 'Secret TITLEMARKER7Q ending', categories: [{ title: 'Category:GTA VI' }] }] } }) },
  { match: ['list=search', 'en.wikipedia.org'], result: okJson({ query: { search: [{ title: 'Grand Theft Auto VI', snippet: 'Grand Theft Auto VI BODYMARKER7Q' }] } }) },
  { match: ['page=Secrets and Easter Eggs in GTA VI'], result: okJson(parse('Secrets and Easter Eggs in GTA VI')) },
  { match: ['action=parse'], result: okJson(parse('Cheats in GTA VI')) },
];

type AnyEnvelope = Envelope<unknown>;

async function everything(deps: Deps, spoilers: 'hints' | 'discovery' | 'full'): Promise<AnyEnvelope[]> {
  return [
    await searchGta6({ query: 'secret', limit: SEARCH_LIMIT, spoilers }, deps),
    await getPage({ title: 'Cheats in GTA VI', source: 'fandom', spoilers }, deps),
    await getPage({ title: 'Cheats in GTA VI', section: 'Secret ending', source: 'fandom', spoilers }, deps),
    await getPage({ title: 'Secret TITLEMARKER7Q ending', source: 'fandom', spoilers }, deps),
    await listCheats({ include_unverified: true, spoilers }, deps),
    await easterEggs({ spoilers }, deps),
  ];
}

const serialise = (envelopes: readonly AnyEnvelope[]): string => envelopes.map((e) => `${JSON.stringify(e)}\n${renderText(e)}`).join('\n');
const leaked = (text: string): string[] => MARKERS.filter((marker) => text.includes(marker));

describe.each(['hints', 'discovery'] as const)('%s mode', (level) => {
  it('leaks no unreviewed marker into any field or text block', async () => {
    const out = await everything({ http: fakeHttp(routes), manifest }, level);
    expect(leaked(serialise(out))).toEqual([]);
  });

  it('withholds a whole row when it has no review', async () => {
    const cheats = await listCheats({ include_unverified: true, spoilers: level }, { http: fakeHttp(routes), manifest });
    expect(cheats.results.map((r) => r.name)).toEqual(['Confirmed Cheat', 'Template Cheat']);
    expect(cheats.results[0]).toMatchObject({ unlock_requirement: null, unlock_spoiler_class: 'full' });
    expect(cheats.results[1]?.evidence[0]?.claim_text_reviewed).toBeNull();
    expect(cheats.notices.filter((n) => n.type === 'spoiler_withheld')).toEqual([{ type: 'spoiler_withheld', message: WITHHELD }]);
  });

  it('returns partial with empty results when everything is withheld', async () => {
    const deps = { http: fakeHttp(routes), manifest };
    const section = await getPage({ title: 'Cheats in GTA VI', section: 'Secret ending', source: 'fandom', spoilers: level }, deps);
    const unreviewedTitle = await getPage({ title: 'Secret TITLEMARKER7Q ending', source: 'fandom', spoilers: level }, deps);
    const eggs = await easterEggs({ spoilers: level }, deps);
    [section, unreviewedTitle, eggs].map((envelope) =>
      expect(envelope).toMatchObject({ status: 'partial', results: [], sources: [], notices: [{ type: 'spoiler_withheld', message: WITHHELD }] }),
    );
  });
});

describe('full mode', () => {
  it('returns every marker, bounded and attributed', async () => {
    const out = await everything({ http: fakeHttp(routes), manifest }, 'full');
    expect(leaked(serialise(out))).toEqual(MARKERS);
    expect(out.every((e) => e.sources.length > 0)).toBe(true);
  });
});

describe('warm cache', () => {
  it('still withholds on a restricted call made right after a full call', async () => {
    const http: FakeHttp = fakeHttp(routes);
    const deps = { http, manifest };
    const full = await everything(deps, 'full');
    const restricted = await everything(deps, 'hints');
    expect(leaked(serialise(full))).toEqual(MARKERS);
    expect(leaked(serialise(restricted))).toEqual([]);
  });

  it('withholds through the real cache as well', async () => {
    const { createHttp } = await import('../src/net.js');
    let upstreamCalls = 0;
    const http = createHttp({
      fetch: async (): Promise<Response> => {
        upstreamCalls += 1;
        return new Response(JSON.stringify(parse('Cheats in GTA VI')), { headers: { 'content-type': 'application/json' } });
      },
      now: (): number => 0,
      sleep: async (): Promise<void> => {},
      exactUrls: new Set(),
      fandomPermitted: true,
    });
    const args = { title: 'Cheats in GTA VI', section: 'Secret ending', source: 'fandom' } as const;
    const full = await getPage({ ...args, spoilers: 'full' }, { http, manifest });
    const hints = await getPage({ ...args, spoilers: 'hints' }, { http, manifest });
    expect(upstreamCalls).toBe(1);
    expect(leaked(serialise([full]))).toEqual(['BODYMARKER7Q', 'LOCATIONMARKER7Q']);
    expect(leaked(serialise([hints]))).toEqual([]);
    expect(hints.status).toBe('partial');
  });
});
