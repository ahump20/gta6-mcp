import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { mentionsGtaVi, parseCheatTable, parseInput, splitSections, toPlainText } from '../src/wikitext.js';

const real = (name: string): string =>
  (JSON.parse(readFileSync(`tests/fixtures/real/${name}`, 'utf8')) as { parse: { wikitext: string } }).parse.wikitext;

const cheats = real('fandom-parse-cheats-gta-vi.json');
const gtaV = real('fandom-parse-redirect-cheats-gta-5.json');
const REAL_ROW_COUNT = 18;
const ATTACK_FORCE_GAMESPOT = ['Down', 'Up', 'Left', 'Right', 'Down', 'Down', 'Up', 'Down'];

describe('splitSections', () => {
  it('splits the real cheats page into a lead and four sections', () => {
    expect(splitSections(cheats).map((s) => s.heading)).toEqual(['', 'Activating cheats', 'Cheats', 'References', 'Navigation']);
  });

  it('keeps each section body with its heading', () => {
    const section = splitSections(cheats).find((s) => s.heading === 'Activating cheats');
    expect(section?.wikitext).toContain('hold L1 + R1');
    expect(section?.wikitext).not.toContain('wikitable');
  });
});

describe('parseInput', () => {
  it('reads a plain comma-separated sequence', () => {
    expect(parseInput('Up, Right, Down, Left')).toMatchObject({ input: ['Up', 'Right', 'Down', 'Left'], status: 'known', unresolved: [] });
  });

  it('does not guess a malformed token', () => {
    expect(parseInput('Down, Up, Left, Left, Right, Down, Left, Up Down')).toMatchObject({ input: null, status: 'unknown' });
  });

  it('treats ??? and an empty cell as an omission', () => {
    expect(parseInput('???')).toMatchObject({ input: null, status: 'unknown' });
    expect(parseInput('  ')).toMatchObject({ input: null, status: 'unknown' });
  });

  it('uses undiscovered only for an explicit statement', () => {
    expect(parseInput('Not yet discovered')).toMatchObject({ input: null, status: 'undiscovered' });
    expect(parseInput('Undiscovered')).toMatchObject({ input: null, status: 'undiscovered' });
  });

  it('maps the observed D-pad image link through its alt text', () => {
    const cell = '[[File:Xbox Left.png|25px|D-Pad Left]], [[File:Xbox Right.png|25px|D-Pad Right]]';
    expect(parseInput(cell)).toMatchObject({ input: ['Left', 'Right'], status: 'known' });
  });

  it('marks a real GTA V row with face buttons as unknown', () => {
    const cell = gtaV.split('\n|-\n')[1]?.split('\n|').at(-1) ?? '';
    expect(cell).toContain('XBox B.png');
    expect(parseInput(cell)).toMatchObject({ input: null, status: 'unknown' });
  });

  it('reports an unresolved template and withholds the sequence', () => {
    expect(parseInput('{{dpad|up}}, Down')).toEqual({ input: null, status: 'unknown', unresolved: ['{{dpad|up}}'] });
  });
});

describe('parseCheatTable', () => {
  const rows = parseCheatTable(cheats);

  it('reads every row of the real cheats table', () => {
    expect(rows).toHaveLength(REAL_ROW_COUNT);
    expect(rows[0]).toMatchObject({ name: '$250,000', effect: 'Instantly gives you $250,000.', unlock: 'Finish the story' });
  });

  it('reads Attack Force as the wiki states it', () => {
    expect(rows.find((r) => r.name === 'Attack Force')).toMatchObject({ input: ATTACK_FORCE_GAMESPOT, input_status: 'known' });
  });

  it('leaves Vehicle Force unknown because its last token is malformed', () => {
    expect(rows.find((r) => r.name === 'Vehicle Force')).toMatchObject({
      input: null,
      input_status: 'unknown',
      code_raw: 'Down, Up, Left, Left, Right, Down, Left, Up Down',
    });
  });

  it('gives each row a stable text for fingerprinting', () => {
    expect(rows[0]?.row_text).toBe('$250,000 | Instantly gives you $250,000. | Finish the story | Up, Right, Down, Left, Up, Left, Down, Right');
  });

  it('returns nothing for a page without a cheat table', () => {
    expect(parseCheatTable('Just text.\n{| class="wikitable"\n!A\n!B\n|-\n|1\n|2\n|}')).toEqual([]);
  });
});

describe('toPlainText', () => {
  it('keeps headings and prose and drops markup', () => {
    const { text } = toPlainText(cheats);
    expect(text).toContain('The following is a list of cheats in');
    expect(text).toContain('== Activating cheats ==');
    expect(text).toContain('Attack Force | Bullets and melee attacks launch targets on impact');
    const leftovers = ['{{', '}}', '[[', '<ref', "'''", 'Navbox'].filter((mark) => text.includes(mark));
    expect(leftovers).toEqual([]);
  });

  it('drops sections left empty and returns reference links', () => {
    const { text, references } = toPlainText(cheats);
    expect(text).not.toContain('== Navigation ==');
    expect(references).toEqual(['https://www.gamespot.com/articles/all-gta-6-cheats-and-how-to-unlock-them/']);
  });

  it('removes scripts, tags, comments and nested templates', () => {
    const { text } = toPlainText("A<script>alert(1)</script> <b>bold</b> <!-- hidden -->{{outer|{{inner|x}}|y}} [[Vice City|the city]] [[File:a.png|thumb|caption [[link]]]] end");
    expect(text).toBe('A bold the city end');
  });
});

describe('mentionsGtaVi', () => {
  it.each(['{{VI}}', 'in Grand Theft Auto VI.', 'GTA VI cheats', 'GTA 6 map', '[[Category:Locations in GTA VI]]'])('accepts %s', (text) => {
    expect(mentionsGtaVi(text)).toBe(true);
  });

  it.each(['Grand Theft Auto V', 'GTA Vice City', 'Grand Theft Auto: Vice City', 'GTA VII', 'GTA 64'])('rejects %s', (text) => {
    expect(mentionsGtaVi(text)).toBe(false);
  });
});
