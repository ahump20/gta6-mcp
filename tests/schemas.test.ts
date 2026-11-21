import { describe, expect, it } from 'vitest';
import { CheatRow, CheatsInput, SearchInput, WITHHELD_MESSAGE, notice } from '../src/schemas.js';

const DEFAULT_LIMIT = 5;
const OVER_MAX_LIMIT = 11;

const row = {
  claim_id: 'gta6-x-unattributed-00000000',
  name: 'X',
  input: null,
  input_status: 'unknown',
  input_method: 'd-pad',
  entry_steps: null,
  platform: 'unattributed',
  effect: null,
  unlock_requirement: null,
  unlock_spoiler_class: 'unclassified',
  game_version: null,
  confidence: 'unverified',
  conflict_group_id: null,
  evidence: [],
  reason: 'r',
  source_page_url: 'https://gta.fandom.com/wiki/Cheats_in_GTA_VI',
};

describe('schemas', () => {
  it('search input defaults limit to 5 and spoilers to hints', () => {
    expect(SearchInput.parse({ query: 'q' })).toEqual({ query: 'q', limit: DEFAULT_LIMIT, spoilers: 'hints' });
  });

  it('search input rejects a limit above 10', () => {
    expect(SearchInput.safeParse({ query: 'q', limit: OVER_MAX_LIMIT }).success).toBe(false);
  });

  it('cheats input defaults include_unverified to false', () => {
    expect(CheatsInput.parse({})).toEqual({ include_unverified: false, spoilers: 'hints' });
  });

  it('accepts an unknown input with a null sequence', () => {
    expect(CheatRow.safeParse(row).success).toBe(true);
  });

  it('rejects an unknown input that still carries a sequence', () => {
    expect(CheatRow.safeParse({ ...row, input: ['Up'] }).success).toBe(false);
  });

  it('rejects a known input without a sequence', () => {
    expect(CheatRow.safeParse({ ...row, input_status: 'known' }).success).toBe(false);
  });

  it('builds the generic withheld notice', () => {
    expect(notice('spoiler_withheld')).toEqual({ type: 'spoiler_withheld', message: WITHHELD_MESSAGE });
    expect(WITHHELD_MESSAGE).toBe('Content withheld by spoiler policy.');
  });
});
