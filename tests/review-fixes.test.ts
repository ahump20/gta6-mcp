// Regression tests for defects found in review of pull request 1. Fixtures from tests/synthetic.ts are SYNTHETIC.
import { describe, expect, it } from 'vitest';
import { assertPolicy, decideConfidence, fingerprint, loadManifest, validatePolicy } from '../src/evidence.js';
import { createHttp } from '../src/net.js';
import { type Deps, easterEggs, listCheats, renderText } from '../src/tools.js';
import { parseCheatTable } from '../src/wikitext.js';
import { type Route, fakeHttp, fixtureJson, okJson, okText } from './helpers.js';
import { SYN_GUIDE_URL, SYN_QUOTE, SYN_WIKITEXT, synConflict, synManifest, synReport, synResolution } from './synthetic.js';

const SYNTHETIC_OK = { allowSynthetic: true };
const TWO = 2;
const MARKER = 'ORACLEMARKER7Q';
const candidate = { name: 'Confirmed Cheat', input: ['Up', 'Down'] as const, platform: 'ps5' as const, extractionIssue: false };
const synPage: Route = { match: ['page=Cheats in GTA VI'], result: okJson({ parse: { title: 'Cheats in GTA VI', revid: 1, wikitext: SYN_WIKITEXT } }) };
const guideOk: Route = { match: [SYN_GUIDE_URL], result: okText(`<p>${SYN_QUOTE}</p>`) };
const missingPage: Route = { match: ['action=parse'], result: okJson(fixtureJson('real/fandom-parse-missingtitle.json')) };
const rowPrint = (name: string): string => fingerprint(parseCheatTable(SYN_WIKITEXT).find((r) => r.name === name)?.row_text ?? '');
const base = synManifest();
const withRowReview = (level: 'hints' | 'discovery') => ({
  ...base.spoiler_registry,
  cheat_rows: [{ name: 'Confirmed Cheat', row_fingerprint: rowPrint('Confirmed Cheat'), min_level: level, unlock_min_level: 'full' as const }],
});

describe('resolutions', () => {
  it('does not let a rejected resolution lift a conflict', () => {
    const rejected = { ...synResolution(TWO), review: { ...synResolution(TWO).review, decision: 'rejected' as const } };
    const manifest = synManifest({ conflict_groups: [synConflict], resolutions: [rejected] });
    expect(decideConfidence({ ...candidate, manifest, binding: 'match' }).confidence).toBe('conflicting');
  });

  it('requires dispositions to agree with the winner', () => {
    const both = { ...synResolution(TWO), dispositions: synResolution(TWO).dispositions.map((d) => ({ ...d, disposition: 'upheld' as const })) };
    const errors = validatePolicy(synManifest({ conflict_groups: [synConflict], resolutions: [both] }), SYNTHETIC_OK);
    expect(errors.join(' ')).toContain('disposition');
  });
});

describe('startup', () => {
  it('refuses a manifest that fails policy and accepts the shipped one', () => {
    expect(() => assertPolicy(synManifest())).toThrow(/synthetic/);
    expect(assertPolicy(loadManifest()).synthetic).toBe(false);
  });
});

describe('network', () => {
  it('turns a failed body read into a failure result', async () => {
    const broken = (): Response =>
      new Response(new ReadableStream({ pull: (controller) => controller.error(new Error('stalled')) }), { headers: { 'content-type': 'application/json' } });
    const http = createHttp({ fetch: async () => broken(), now: () => 0, sleep: async () => {}, exactUrls: new Set(), fandomPermitted: true });
    expect(await http.get('https://en.wikipedia.org/w/api.php?action=query')).toMatchObject({ ok: false, reason: 'network' });
  });
});

describe('list_cheats spoiler clearance', () => {
  it('does not treat a confirmation as spoiler clearance', async () => {
    const unreviewed: Deps = { http: fakeHttp([guideOk, synPage]), manifest: synManifest() };
    const hidden = await listCheats({ include_unverified: false, spoilers: 'hints' }, unreviewed);
    expect(hidden.results).toEqual([]);
    expect(hidden.notices.map((n) => n.type)).toContain('spoiler_withheld');
    const reviewed: Deps = { http: fakeHttp([guideOk, synPage]), manifest: synManifest({ spoiler_registry: withRowReview('hints') }) };
    const shown = await listCheats({ include_unverified: false, spoilers: 'hints' }, reviewed);
    expect(shown.results.map((r) => [r.name, r.confidence])).toEqual([['Confirmed Cheat', 'confirmed']]);
  });

  it('applies the dispute level even when the wiki row is cleared lower', async () => {
    const manifest = synManifest({ confirmations: [], conflict_groups: [{ ...synConflict, min_level: 'discovery' }], spoiler_registry: withRowReview('hints') });
    const names = async (spoilers: 'hints' | 'discovery'): Promise<string[]> =>
      (await listCheats({ include_unverified: true, spoilers }, { http: fakeHttp([synPage]), manifest })).results.filter((r) => r.conflict_group_id !== null).map((r) => r.claim_id);
    expect(await names('hints')).toEqual([]);
    expect(await names('discovery')).toEqual(['syn-confirmed-ps5', 'syn-confirmed-ps5-b']);
  });
});

describe('list_cheats recorded reports', () => {
  const absent = { ...synConflict, conflict_group_id: 'cg-absent', cheat_name: 'Absent Cheat', min_level: 'hints' as const };
  const manifest = synManifest({ confirmations: [], conflict_groups: [absent], community_reports: [synReport()] });

  it('keeps them when the wiki has no cheats page', async () => {
    const out = await listCheats({ include_unverified: true, spoilers: 'hints' }, { http: fakeHttp([missingPage]), manifest });
    expect(out.status).toBe('partial');
    expect(out.results.map((r) => r.claim_id)).toEqual(['syn-confirmed-ps5', 'syn-confirmed-ps5-b', 'syn-report-1']);
  });

  it('adds a recorded dispute the wiki has no row for', async () => {
    const out = await listCheats({ include_unverified: true, spoilers: 'hints' }, { http: fakeHttp([synPage]), manifest });
    expect(out.results.filter((r) => r.conflict_group_id === 'cg-absent').map((r) => r.claim_id)).toEqual(['syn-confirmed-ps5', 'syn-confirmed-ps5-b']);
  });

  it('puts each report next to its evidence link in the text', async () => {
    const off: Route = { match: ['gta.fandom.com'], result: { ok: false, reason: 'not_permitted', detail: 'simulated' } };
    const text = renderText(await listCheats({ include_unverified: true, spoilers: 'hints' }, { http: fakeHttp([off]), manifest: loadManifest() }));
    const eight = text.split('\n').find((line) => line.includes('Down, Up, Left, Right, Down, Down, Up, Down')) ?? '';
    expect(eight).toContain('https://www.gamespot.com/');
  });
});

describe('easter_eggs topic filter', () => {
  it('gives the same answer whether or not a topic matches withheld content', async () => {
    const hidden = synReport({ id: 'syn-egg-hidden', min_level: 'full', description: `SYNTHETIC ${MARKER}`, subject: { kind: 'easter_egg', title: `Egg ${MARKER}`, evidence_status: 'theory' } });
    const deps = (): Deps => ({ http: fakeHttp([missingPage]), manifest: synManifest({ confirmations: [], community_reports: [hidden] }) });
    const matching = await easterEggs({ topic: MARKER, spoilers: 'hints' }, deps());
    const other = await easterEggs({ topic: 'zzzz', spoilers: 'hints' }, deps());
    expect(matching).toEqual(other);
  });
});
