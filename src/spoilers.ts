// Default-deny spoiler decisions. Below "full", a field is disclosed only when
// a reviewed registry item covers it and the live text still matches the review.
import { type SpoilerRegistry, fingerprint } from './evidence.js';
import type { Provider, SpoilerLevel } from './schemas.js';

const ORDER: readonly SpoilerLevel[] = ['hints', 'discovery', 'full'];

export function allows(minLevel: SpoilerLevel, requested: SpoilerLevel): boolean {
  return ORDER.indexOf(requested) >= ORDER.indexOf(minLevel);
}

export function titleAllowed(registry: SpoilerRegistry, provider: Provider, title: string, level: SpoilerLevel): boolean {
  if (level === 'full') return true;
  return registry.titles.some((t) => t.provider === provider && t.title === title && allows(t.min_level, level));
}

export function sectionAllowed(
  registry: SpoilerRegistry,
  provider: Provider,
  title: string,
  heading: string,
  text: string,
  level: SpoilerLevel,
): boolean {
  if (level === 'full') return true;
  const print = fingerprint(text);
  return registry.sections.some(
    (s) => s.provider === provider && s.title === title && s.heading === heading && s.fingerprint === print && allows(s.min_level, level),
  );
}

export function sectionReviewed(registry: SpoilerRegistry, provider: Provider, title: string, heading: string, text: string): boolean {
  return sectionAllowed(registry, provider, title, heading, text, 'discovery');
}

export function rowReview(registry: SpoilerRegistry, rowText: string): SpoilerRegistry['cheat_rows'][number] | null {
  const print = fingerprint(rowText);
  return registry.cheat_rows.find((row) => row.row_fingerprint === print) ?? null;
}
