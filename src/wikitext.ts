// Wikitext handling. All source text is untrusted data: it is reduced to plain
// text and never interpreted.
import { DPAD } from './schemas.js';

export type Direction = (typeof DPAD)[number];
export type InputStatus = 'known' | 'unknown' | 'undiscovered';

export interface Section {
  readonly heading: string;
  readonly level: number;
  readonly wikitext: string;
}

export interface ParsedInput {
  readonly input: Direction[] | null;
  readonly status: InputStatus;
  /** Raw template tokens that could not be resolved. */
  readonly unresolved: string[];
}

export interface ParsedCheatRow {
  readonly name: string;
  readonly effect: string | null;
  readonly unlock: string | null;
  readonly code_raw: string;
  readonly input: Direction[] | null;
  readonly input_status: InputStatus;
  readonly unresolved: string[];
  /** Normalised cell text, the basis for review fingerprints. */
  readonly row_text: string;
}

const MAX_REFERENCES = 50; // per page, to keep results bounded

// Heading line. Accepts "==Cheats==" and "=== Wanted level ===". Rejects "= x" and "a == b". https://regex101.com/?regex=%5E(%3D%7B2%2C6%7D)%5Cs*(.*%3F)%5Cs*%5C1%5Cs*%24&flags=&flavor=javascript&testString=%3D%3DCheats%3D%3D%0A%3D%3D%3D%20Wanted%20level%20%3D%3D%3D%0A%3D%20x%0Aa%20%3D%3D%20b
const HEADING = /^(={2,6})\s*(.*?)\s*\1\s*$/;
// Template with no template inside it. Accepts "{{VI}}" and "{{dpad|up}}". Rejects "{{a|{{b}}}}" as a whole and "{x}". https://regex101.com/?regex=%5C%7B%5C%7B%5B%5E%7B%7D%5D*%5C%7D%5C%7D&flags=g&flavor=javascript&testString=%7B%7BVI%7D%7D%0A%7B%7Bdpad%7Cup%7D%7D%0A%7B%7Ba%7C%7B%7Bb%7D%7D%7D%7D%0A%7Bx%7D
const INNERMOST_TEMPLATE = /\{\{[^{}]*\}\}/g;
// File, image or category link with no link inside it. Accepts "[[File:a.png|25px|B]]" and "[[Category:GTA VI]]". Rejects "[[Vice City]]". https://regex101.com/?regex=%5C%5B%5C%5B%5Cs*(%3F%3AFile%7CImage%7CCategory)%5Cs*%3A%5B%5E%5B%5C%5D%5D*%5C%5D%5C%5D&flags=gi&flavor=javascript&testString=%5B%5BFile%3Aa.png%7C25px%7CB%5D%5D%0A%5B%5BCategory%3AGTA%20VI%5D%5D%0A%5B%5BVice%20City%5D%5D
const INNERMOST_MEDIA_LINK = /\[\[\s*(?:File|Image|Category)\s*:[^[\]]*\]\]/gi;
// Image link with alt text last. Accepts "[[File:Xbox Left.png|25px|D-Pad Left]]" (captures "D-Pad Left"). Rejects "[[Xbox]]". https://regex101.com/?regex=%5C%5B%5C%5B%5Cs*(%3F%3AFile%7CImage)%5Cs*%3A%5B%5E%5B%5C%5D%7C%5D*(%3F%3A%5C%7C%5B%5E%5B%5C%5D%7C%5D*)*%5C%7C(%5B%5E%5B%5C%5D%7C%5D*)%5C%5D%5C%5D&flags=gi&flavor=javascript&testString=%5B%5BFile%3AXbox%20Left.png%7C25px%7CD-Pad%20Left%5D%5D%0AD-Pad%20Left%0A%5B%5BXbox%5D%5D
const IMAGE_ALT = /\[\[\s*(?:File|Image)\s*:[^[\]|]*(?:\|[^[\]|]*)*\|([^[\]|]*)\]\]/gi;
// Start of a file, image or category link. Accepts "[[File:a.png" and "[[Category:GTA VI". Rejects "[[Vice City". https://regex101.com/?regex=%5E%5C%5B%5C%5B%5Cs*(%3F%3AFile%7CImage%7CCategory)%5Cs*%3A&flags=i&flavor=javascript&testString=%5B%5BFile%3Aa.png%0A%5B%5BCategory%3AGTA%20VI%0A%5B%5BVice%20City
const MEDIA_PREFIX = /^\[\[\s*(?:File|Image|Category)\s*:/i;
// Internal link. Accepts "[[Vice City]]" and "[[Vice City|the city]]" (captures the label). Rejects "[Vice City]". https://regex101.com/?regex=%5C%5B%5C%5B(%3F%3A%5B%5E%5B%5C%5D%7C%5D*%5C%7C)%3F(%5B%5E%5B%5C%5D%7C%5D*)%5C%5D%5C%5D&flags=g&flavor=javascript&testString=%5B%5BVice%20City%5D%5D%0A%5B%5BVice%20City%7Cthe%20city%5D%5D%0A%5BVice%20City%5D
const INTERNAL_LINK = /\[\[(?:[^[\]|]*\|)?([^[\]|]*)\]\]/g;
// External link with a label. Accepts "[https://a.test/x Label]" (captures "Label"). Rejects "[note]". https://regex101.com/?regex=%5C%5Bhttps%3F%3A%5C%2F%5C%2F%5B%5E%5Cs%5C%5D%5D%2B%5Cs*(%5B%5E%5C%5D%5D*)%5C%5D&flags=g&flavor=javascript&testString=%5Bhttps%3A%2F%2Fa.test%2Fx%20Label%5D%0ALabel%0A%5Bnote%5D
const EXTERNAL_LINK = /\[https?:\/\/[^\s\]]+\s*([^\]]*)\]/g;
// URL inside a reference. Accepts "https://www.gamespot.com/articles/x/". Rejects "ftp://a". https://regex101.com/?regex=https%3F%3A%5C%2F%5C%2F%5B%5E%5Cs%5C%5D%7C%7D%3C%22%5D%2B&flags=g&flavor=javascript&testString=https%3A%2F%2Fwww.gamespot.com%2Farticles%2Fx%2F%0Aftp%3A%2F%2Fa
const URL_IN_TEXT = /https?:\/\/[^\s\]|}<"]+/g;
// Reference element with a body. Accepts '<ref name="a">text</ref>'. Rejects '<ref name="a" />'. https://regex101.com/?regex=%3Cref%5Cb%5B%5E%3E%2F%5D*%3E%5B%5Cs%5CS%5D*%3F%3C%5C%2Fref%3E&flags=gi&flavor=javascript&testString=%3Cref%20name%3D%22a%22%3Etext%3C%2Fref%3E%0A%3Cref%20name%3D%22a%22%20%2F%3E
const REF_BLOCK = /<ref\b[^>/]*>[\s\S]*?<\/ref>/gi;
// Script or style element. Accepts "<script>alert(1)</script>". Rejects "<b>x</b>". https://regex101.com/?regex=%3C(script%7Cstyle)%5Cb%5B%5Cs%5CS%5D*%3F%3C%5C%2F%5C1%3E&flags=gi&flavor=javascript&testString=%3Cscript%3Ealert(1)%3C%2Fscript%3E%0A%3Cb%3Ex%3C%2Fb%3E
const SCRIPT_BLOCK = /<(script|style)\b[\s\S]*?<\/\1>/gi;
// HTML comment. Accepts "<!-- hidden -->". Rejects "<b>". https://regex101.com/?regex=%3C!--%5B%5Cs%5CS%5D*%3F--%3E&flags=g&flavor=javascript&testString=%3C!--%20hidden%20--%3E%0A%3Cb%3E
const COMMENT = /<!--[\s\S]*?-->/g;
// Any remaining tag. Accepts "<b>", "</div>" and "<ref name='a' />". Rejects "a < b". https://regex101.com/?regex=%3C%5C%2F%3F%5Ba-zA-Z%5D%5B%5E%3E%5D*%3E&flags=g&flavor=javascript&testString=%3Cb%3E%0A%3C%2Fdiv%3E%0A%3Cref%20name%3D'a'%20%2F%3E%0Aa%20%3C%20b
const TAG = /<\/?[a-zA-Z][^>]*>/g;
// Bold or italic quote run. Accepts "''" and "'''". Rejects "'". https://regex101.com/?regex='%7B2%2C%7D&flags=g&flavor=javascript&testString=''%0A'''%0A'
const QUOTE_RUN = /'{2,}/g;
// Phrases a source uses to say an input is still missing. A bare "???" is an omission, not a statement.
const MISSING_INPUT_PHRASES: readonly string[] = ['undiscovered', 'not yet discovered', 'not been discovered', 'not discovered', 'not yet found', 'not been found'];
// The game named in page text. Accepts "GTA VI", "GTA 6", "Grand Theft Auto VI" and "{{VI}}". Rejects "GTA Vice City", "GTA VII" and "GTA 64". https://regex101.com/?regex=%5C%7B%5C%7BVI%5C%7D%5C%7D%7C%5Cb(%3F%3AGrand%20Theft%20Auto%7CGTA)%5Cs%2B(%3F%3AVI%7C6)(%3F!%5B%5Cw%5D)&flags=&flavor=javascript&testString=GTA%20VI%0AGTA%206%0AGrand%20Theft%20Auto%20VI%0A%7B%7BVI%7D%7D%0AGTA%20Vice%20City%0AGTA%20VII%0AGTA%2064
const GTA_VI = /\{\{VI\}\}|\b(?:Grand Theft Auto|GTA)\s+(?:VI|6)(?![\w])/;
// Table row separator line. Accepts "\n|-\n" and '\n|- style="x"\n'. Rejects "\n| -1\n". https://regex101.com/?regex=%5Cn%5C%7C-%5B%5E%5Cn%5D*(%3F%3D%5Cn)&flags=&flavor=javascript&testString=%5Cn%7C-%5Cn%0A%5Cn%7C-%20style%3D%22x%22%5Cn%0A%5Cn%7C%20-1%5Cn
const ROW_SEPARATOR = /\n\|-[^\n]*(?=\n)/;
// Run of spaces and tabs. Accepts "  " and "\t". Rejects "\n". https://regex101.com/?regex=%5B%20%5Ct%5D%2B&flags=g&flavor=javascript&testString=%20%20%0A%5Ct%0A%5Cn
const INLINE_SPACE = /[ \t]+/g;
// Three or more line breaks. Accepts "\n\n\n". Rejects "\n\n". https://regex101.com/?regex=%5Cn%7B3%2C%7D&flags=g&flavor=javascript&testString=%5Cn%5Cn%5Cn%0A%5Cn%5Cn
const BLANK_RUN = /\n{3,}/g;

const ENTITIES: Readonly<Record<string, string>> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

const ALT_TO_DIRECTION: Readonly<Record<string, Direction>> = {
  up: 'Up',
  down: 'Down',
  left: 'Left',
  right: 'Right',
  'd-pad up': 'Up',
  'd-pad down': 'Down',
  'd-pad left': 'Left',
  'd-pad right': 'Right',
};

/** Applies a replacement until the text stops changing, so nesting unwinds from the inside. */
function replaceNested(text: string, pattern: RegExp, replacement: string): string {
  const next = text.replace(pattern, replacement);
  return next === text ? text : replaceNested(next, pattern, replacement);
}

function decodeEntities(text: string): string {
  return Object.entries(ENTITIES).reduce((out, [entity, char]) => out.replaceAll(entity, char), text);
}

export function mentionsGtaVi(text: string): boolean {
  return GTA_VI.test(text);
}

export function splitSections(wikitext: string): Section[] {
  return wikitext.split('\n').reduce<Section[]>(
    (sections, line) => {
      const match = HEADING.exec(line);
      if (match) return [...sections, { heading: match[2] ?? '', level: (match[1] ?? '').length, wikitext: '' }];
      const last = sections.at(-1);
      if (!last) return sections;
      const body = last.wikitext === '' ? line : `${last.wikitext}\n${line}`;
      return [...sections.slice(0, -1), { ...last, wikitext: body }];
    },
    [{ heading: '', level: 0, wikitext: '' }],
  );
}

function inlineText(wikitext: string): string {
  const unreffed = wikitext.replace(COMMENT, '').replace(SCRIPT_BLOCK, '').replace(REF_BLOCK, '');
  const untemplated = replaceNested(unreffed, INNERMOST_TEMPLATE, '');
  const keepLabel = (whole: string, label: string): string => (MEDIA_PREFIX.test(whole) ? whole : label);
  const linked = replaceNested(untemplated.replace(INTERNAL_LINK, keepLabel), INNERMOST_MEDIA_LINK, '');
  return decodeEntities(linked.replace(EXTERNAL_LINK, '$1').replace(TAG, '').replace(QUOTE_RUN, ''));
}

function tableLine(line: string): string {
  if (line.startsWith('{|') || line.startsWith('|}') || line.startsWith('|+')) return '';
  if (line.startsWith('|-')) return '\n';
  if (line.startsWith('!') || line.startsWith('|')) return `${line.slice(1).trim()} | `;
  return `${line}\n`;
}

export function toPlainText(wikitext: string): { text: string; references: string[] } {
  const refs = [...wikitext.matchAll(REF_BLOCK)].flatMap((ref) => ref[0].match(URL_IN_TEXT) ?? []);
  const references = [...new Set(refs)].slice(0, MAX_REFERENCES);
  const text = splitSections(wikitext)
    .map((section) => {
      const body = inlineText(section.wikitext)
        .split('\n')
        .map(tableLine)
        .join('')
        .split('\n')
        .map((line) => line.replace(INLINE_SPACE, ' ').trim())
        .map((line) => (line.endsWith(' |') ? line.slice(0, -' |'.length) : line))
        .join('\n')
        .replace(BLANK_RUN, '\n\n')
        .trim();
      if (body === '') return '';
      return section.heading === '' ? body : `== ${inlineText(section.heading).trim()} ==\n${body}`;
    })
    .filter((part) => part !== '')
    .join('\n\n');
  return { text, references };
}

export function parseInput(cell: string): ParsedInput {
  const unresolved = cell.match(INNERMOST_TEMPLATE) ?? [];
  if (unresolved.length > 0) return { input: null, status: 'unknown', unresolved: [...unresolved] };
  const text = decodeEntities(cell.replace(IMAGE_ALT, '$1').replace(QUOTE_RUN, '').replace(TAG, '')).trim();
  if (MISSING_INPUT_PHRASES.some((phrase) => text.toLowerCase().includes(phrase))) return { input: null, status: 'undiscovered', unresolved: [] };
  const tokens = text.split(',').map((token) => ALT_TO_DIRECTION[token.trim().toLowerCase()]);
  const input = tokens.filter((token): token is Direction => token !== undefined);
  return input.length === tokens.length && input.length > 0
    ? { input, status: 'known', unresolved: [] }
    : { input: null, status: 'unknown', unresolved: [] };
}

function cellsOf(row: string, marker: '!' | '|'): string[] {
  return row
    .split('\n')
    .filter((line) => line.startsWith(marker) && !line.startsWith('|-') && !line.startsWith('|}') && !line.startsWith('|+'))
    .flatMap((line) => line.slice(1).split(marker === '!' ? '!!' : '||'))
    .map((cell) => cell.trim());
}

function columnOf(headers: readonly string[], names: readonly string[]): number {
  return headers.findIndex((header) => names.some((name) => header.toLowerCase().includes(name)));
}

export function parseCheatTable(wikitext: string): ParsedCheatRow[] {
  const start = wikitext.indexOf('{|');
  const end = wikitext.indexOf('\n|}', start);
  if (start < 0 || end < 0) return [];
  const [head = '', ...rows] = wikitext.slice(start, end).split(ROW_SEPARATOR);
  const headers = cellsOf(head, '!');
  const nameCol = columnOf(headers, ['cheat']);
  const codeCol = columnOf(headers, ['code', 'activation']);
  if (nameCol < 0 || codeCol < 0) return [];
  const effectCol = columnOf(headers, ['effect']);
  const unlockCol = columnOf(headers, ['unlock']);
  const clean = (cell: string | undefined): string | null => {
    const text = cell === undefined ? '' : inlineText(cell).replace(INLINE_SPACE, ' ').trim();
    return text === '' ? null : text;
  };
  return rows.flatMap((row) => {
    const cells = cellsOf(row, '|');
    const name = clean(cells[nameCol]);
    if (name === null) return [];
    const codeCell = cells[codeCol] ?? '';
    const parsed = parseInput(codeCell);
    const effect = clean(cells[effectCol]);
    const unlock = clean(cells[unlockCol]);
    const code_raw = codeCell.replace(INLINE_SPACE, ' ').trim();
    return [
      {
        name,
        effect,
        unlock,
        code_raw,
        input: parsed.input,
        input_status: parsed.status,
        unresolved: parsed.unresolved,
        row_text: [name, effect ?? '', unlock ?? '', code_raw].join(' | '),
      },
    ];
  });
}
