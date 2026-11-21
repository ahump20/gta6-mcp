import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { describe, expect, it } from 'vitest';
import { loadManifest } from '../src/evidence.js';
import { CheatsOutput, EggsOutput, PageOutput, SearchOutput } from '../src/schemas.js';
import { createServer } from '../src/server.js';
import { renderText } from '../src/tools.js';
import { fakeHttp, fixtureJson, okJson } from './helpers.js';

const TOOL_NAMES = ['easter_eggs', 'get_page', 'list_cheats', 'search_gta6'];
const OVER_MAX_LIMIT = 11;

async function connect(): Promise<Client> {
  const http = fakeHttp([
    { match: ['gta.fandom.com', 'page=Cheats in GTA VI'], result: okJson(fixtureJson('real/fandom-parse-cheats-gta-vi.json')) },
    { match: ['gta.fandom.com', 'list=search'], result: okJson(fixtureJson('real/fandom-search-cheats.json')) },
    { match: ['gta.fandom.com', 'prop=categories'], result: okJson(fixtureJson('real/fandom-categories-search-hits.json')) },
    { match: ['en.wikipedia.org', 'list=search'], result: okJson(fixtureJson('real/wikipedia-search-gta-vi.json')) },
    { match: ['action=parse'], result: okJson(fixtureJson('real/fandom-parse-missingtitle.json')) },
  ]);
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  await createServer({ http, manifest: loadManifest() }).connect(serverSide);
  const client = new Client({ name: 'gta6-mcp-tests', version: '0.0.0' });
  await client.connect(clientSide);
  return client;
}

function textOf(result: { content?: unknown }): string {
  const [first] = result.content as { type: string; text: string }[];
  return first?.text ?? '';
}

describe('server', () => {
  it('exposes exactly four read-only, open-world tools with both schemas', async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(TOOL_NAMES);
    tools.map((tool) => {
      expect(tool.annotations).toMatchObject({ readOnlyHint: true, openWorldHint: true });
      expect(tool.inputSchema).toMatchObject({ type: 'object' });
      expect(tool.outputSchema).toMatchObject({ type: 'object' });
      expect(tool.inputSchema.properties).toHaveProperty('spoilers');
      return expect(tool.description).toContain('spoiler');
    });
  });

  it.each([
    ['list_cheats', { include_unverified: true }, CheatsOutput],
    ['search_gta6', { query: 'GTA VI cheats' }, SearchOutput],
    ['get_page', { title: 'Cheats in GTA VI' }, PageOutput],
    ['easter_eggs', {}, EggsOutput],
  ] as const)('%s returns schema-valid structured content and matching text', async (name, args, schema) => {
    const client = await connect();
    const result = await client.callTool({ name, arguments: args });
    const parsed = schema.parse(result.structuredContent);
    expect(result.isError ?? false).toBe(false);
    expect(textOf(result)).toBe(renderText(parsed));
    expect(parsed.summary).not.toBe('');
  });

  it('applies the hints default when spoilers is omitted', async () => {
    const client = await connect();
    const result = await client.callTool({ name: 'list_cheats', arguments: { include_unverified: true } });
    const parsed = CheatsOutput.parse(result.structuredContent);
    expect(parsed.results.find((r) => r.name === 'Dollhouse')?.unlock_requirement).toBeNull();
  });

  it('rejects an invalid request', async () => {
    const client = await connect();
    const attempt = client.callTool({ name: 'search_gta6', arguments: { query: 'x', limit: OVER_MAX_LIMIT } });
    const outcome = await attempt.then(
      (result) => result.isError === true,
      () => true,
    );
    expect(outcome).toBe(true);
  });
});
