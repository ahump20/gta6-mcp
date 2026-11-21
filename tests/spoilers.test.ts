import { describe, expect, it } from 'vitest';
import { fingerprint } from '../src/evidence.js';
import { allows, rowReview, sectionAllowed, titleAllowed } from '../src/spoilers.js';
import { synManifest } from './synthetic.js';

const base = synManifest().spoiler_registry;
const registry = {
  ...base,
  sections: [
    { provider: 'fandom' as const, title: 'Cheats in GTA VI', heading: 'Activating cheats', min_level: 'hints' as const, fingerprint: fingerprint('reviewed text') },
    { provider: 'fandom' as const, title: 'Cheats in GTA VI', heading: 'Cheats', min_level: 'discovery' as const, fingerprint: fingerprint('table text') },
  ],
  cheat_rows: [{ name: 'A', row_fingerprint: fingerprint('A | e | u | Up'), min_level: 'hints' as const, unlock_min_level: 'discovery' as const }],
};

describe('allows', () => {
  it('orders hints below discovery below full', () => {
    expect(allows('hints', 'hints')).toBe(true);
    expect(allows('discovery', 'hints')).toBe(false);
    expect(allows('discovery', 'discovery')).toBe(true);
    expect(allows('full', 'discovery')).toBe(false);
    expect(allows('full', 'full')).toBe(true);
  });
});

describe('titleAllowed', () => {
  it('allows a reviewed title at hints', () => {
    expect(titleAllowed(registry, 'fandom', 'Cheats in GTA VI', 'hints')).toBe(true);
  });

  it('denies an unreviewed title below full', () => {
    expect(titleAllowed(registry, 'fandom', 'Endings', 'hints')).toBe(false);
    expect(titleAllowed(registry, 'fandom', 'Endings', 'discovery')).toBe(false);
    expect(titleAllowed(registry, 'wikipedia', 'Cheats in GTA VI', 'hints')).toBe(false);
  });

  it('allows anything at full', () => {
    expect(titleAllowed(registry, 'fandom', 'Endings', 'full')).toBe(true);
  });
});

describe('sectionAllowed', () => {
  it('allows a reviewed section while its text is unchanged', () => {
    expect(sectionAllowed(registry, 'fandom', 'Cheats in GTA VI', 'Activating cheats', 'reviewed  text', 'hints')).toBe(true);
  });

  it('denies a reviewed section once its text changes', () => {
    expect(sectionAllowed(registry, 'fandom', 'Cheats in GTA VI', 'Activating cheats', 'reviewed text, now with a plot twist', 'hints')).toBe(false);
  });

  it('respects the section level', () => {
    expect(sectionAllowed(registry, 'fandom', 'Cheats in GTA VI', 'Cheats', 'table text', 'hints')).toBe(false);
    expect(sectionAllowed(registry, 'fandom', 'Cheats in GTA VI', 'Cheats', 'table text', 'discovery')).toBe(true);
  });

  it('denies an unreviewed section below full and allows it at full', () => {
    expect(sectionAllowed(registry, 'fandom', 'Cheats in GTA VI', 'Secret ending', 'x', 'discovery')).toBe(false);
    expect(sectionAllowed(registry, 'fandom', 'Cheats in GTA VI', 'Secret ending', 'x', 'full')).toBe(true);
  });
});

describe('rowReview', () => {
  it('finds a review by the row text fingerprint', () => {
    expect(rowReview(registry, 'A | e | u | Up')).toMatchObject({ min_level: 'hints', unlock_min_level: 'discovery' });
  });

  it('finds nothing once the row changes', () => {
    expect(rowReview(registry, 'A | e | u | Up, Down')).toBeNull();
  });
});
