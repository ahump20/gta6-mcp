#!/usr/bin/env node
// Live protocol smoke test. Starts the server as a child process over real
// stdio, with real upstream requests, once per protocol era.
//
//   node scripts/smoke.mjs [--out report.json] [--sha <commit>] [--wire-dir <dir>] [-- <launcher command...>]
//
// Without a launcher command it runs the built `dist/index.js`. Run `npm run build` first.
// Exit code 1 means a protocol or contract defect. An unreachable upstream is
// reported as coverage, not as a failure.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { CheatsOutput, EggsOutput, PageOutput, SearchOutput } from '../dist/schemas.js';
import { renderText } from '../dist/tools.js';

const MODERN_REVISION = '2026-07-28';
const TOOL_NAMES = ['easter_eggs', 'get_page', 'list_cheats', 'search_gta6'];
const root = fileURLToPath(new URL('..', import.meta.url));
const argv = process.argv.slice(2);
const split = argv.indexOf('--');
const flags = split < 0 ? argv : argv.slice(0, split);
const launcher = split < 0 ? [process.execPath, join(root, 'dist/index.js')] : argv.slice(split + 1);
const flag = (name) => (flags.includes(name) ? flags[flags.indexOf(name) + 1] : undefined);
// Reports are published, so local paths are reduced to placeholders.
const tidy = (text) => String(text).replaceAll(root, './').replaceAll(homedir(), '~').replaceAll(tmpdir(), '$TMPDIR');
const tryExec = (cmd, args) => {
  try {
    return execFileSync(cmd, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
};

const CALLS = [
  { label: 'cheat lookup (default: confirmed only)', name: 'list_cheats', args: {}, schema: CheatsOutput },
  { label: 'cheat lookup (reports, hints)', name: 'list_cheats', args: { include_unverified: true }, schema: CheatsOutput },
  { label: 'easter egg hint', name: 'easter_eggs', args: {}, schema: EggsOutput },
  { label: 'easter egg reports (discovery)', name: 'easter_eggs', args: { spoilers: 'discovery' }, schema: EggsOutput },
  { label: 'map lookup, bounded full text', name: 'get_page', args: { title: 'State of Leonida', spoilers: 'full' }, schema: PageOutput },
  { label: 'map lookup, hints (unreviewed, so withheld)', name: 'get_page', args: { title: 'State of Leonida' }, schema: PageOutput },
  { label: 'cheat entry steps, hints (reviewed section)', name: 'get_page', args: { title: 'Cheats in GTA VI', section: 'Activating cheats' }, schema: PageOutput },
  { label: 'missing section', name: 'get_page', args: { title: 'Cheats in GTA VI', section: 'No such section' }, schema: PageOutput },
  { label: 'missing page', name: 'get_page', args: { title: 'Zzz No Such Page gta6mcp' }, schema: PageOutput },
  { label: 'background (wikipedia)', name: 'get_page', args: { title: 'Grand Theft Auto VI', section: 'Gameplay', source: 'wikipedia', spoilers: 'full' }, schema: PageOutput },
  { label: 'story and setting (wikipedia, full text)', name: 'get_page', args: { title: 'Grand Theft Auto VI', source: 'wikipedia', spoilers: 'full' }, schema: PageOutput },
  { label: 'missing page (wikipedia)', name: 'get_page', args: { title: 'Zzz No Such Page gta6mcp', source: 'wikipedia' }, schema: PageOutput },
  { label: 'gta.wiki source (recognised, never requested)', name: 'get_page', args: { title: 'Cheats in GTA VI', source: 'gtawiki' }, schema: PageOutput },
  { label: 'search', name: 'search_gta6', args: { query: 'Leonida', limit: 5, spoilers: 'full' }, schema: SearchOutput },
];

function check(defects, ok, message) {
  if (!ok) defects.push(message);
}

function sample(parsed) {
  const first = parsed.results[0];
  if (!first) return null;
  if ('text' in first) return { ...first, text: `${first.text.slice(0, 280)}${first.text.length > 280 ? '…' : ''}`, references: first.references.slice(0, 3) };
  return first;
}

async function runEra(label, mode) {
  const defects = [];
  const log = join(flag('--wire-dir') ?? mkdtempSync(join(tmpdir(), 'gta6-mcp-smoke-')), `${label}.wire.jsonl`);
  const [command, ...args] = [process.execPath, join(root, 'scripts/tee.mjs'), log, '--', ...launcher];
  const transport = new StdioClientTransport({ command, args, stderr: 'pipe' });
  const stderr = [];
  transport.stderr?.on('data', (chunk) => stderr.push(chunk.toString('utf8')));
  const client = new Client({ name: 'gta6-mcp-smoke', version: '0.1.0' }, { versionNegotiation: { mode } });
  const report = { label, requested_mode: mode, wire_log: tidy(log), calls: [] };
  try {
    await client.connect(transport);
    report.observed_revision = client.getNegotiatedProtocolVersion() ?? null;
    report.observed_era = client.getProtocolEra() ?? null;
    report.server = client.getServerVersion?.() ?? null;

    const { tools } = await client.listTools();
    report.tools = tools.map((t) => t.name).sort();
    check(defects, JSON.stringify(report.tools) === JSON.stringify(TOOL_NAMES), `expected exactly ${TOOL_NAMES.join(', ')}; got ${report.tools.join(', ')}`);
    for (const tool of tools) {
      check(defects, tool.annotations?.readOnlyHint === true && tool.annotations?.openWorldHint === true, `${tool.name}: annotations must be read-only and open-world`);
      check(defects, tool.inputSchema?.type === 'object' && tool.outputSchema?.type === 'object', `${tool.name}: input and output schemas are required`);
    }

    for (const call of CALLS) {
      const result = await client.callTool({ name: call.name, arguments: call.args });
      const parsed = call.schema.safeParse(result.structuredContent);
      const text = result.content?.[0]?.text ?? '';
      const entry = { label: call.label, tool: call.name, arguments: call.args, is_error: result.isError === true, schema_valid: parsed.success };
      check(defects, result.isError !== true, `${call.label}: tool returned isError`);
      check(defects, parsed.success, `${call.label}: structuredContent does not match outputSchema`);
      if (parsed.success) {
        const out = parsed.data;
        entry.text_matches_structured = text === renderText(out);
        check(defects, entry.text_matches_structured, `${call.label}: text is not derived from structuredContent`);
        const provenance = out.sources.every((s) => s.url.startsWith('https://') && s.retrieved_at !== '' && s.license !== '');
        check(defects, provenance, `${call.label}: a source lacks url, retrieved_at or license`);
        check(defects, out.results.length === 0 || out.sources.length > 0, `${call.label}: results without sources`);
        Object.assign(entry, {
          status: out.status,
          summary: out.summary,
          result_count: out.results.length,
          notices: out.notices,
          sources: out.sources,
          first_result: sample(out),
        });
      }
      report.calls.push(entry);
    }
  } catch (error) {
    defects.push(`connection or call failed: ${error?.message ?? error}`);
  }
  await client.close().catch((error) => defects.push(`close failed: ${error.message}`));
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const wire = readFileSync(log, 'utf8').trim().split('\n').map((line) => JSON.parse(line));
  const sent = wire.filter((w) => w.direction === 'client_to_server').map((w) => JSON.parse(w.line));
  const received = wire.filter((w) => w.direction === 'server_to_client');
  const methods = [...new Set(sent.map((m) => m.method).filter(Boolean))];
  const stdoutClean = received.every((w) => {
    try {
      return JSON.parse(w.line).jsonrpc === '2.0';
    } catch {
      return false;
    }
  });
  const exits = wire.filter((w) => w.event === 'exit');
  const spawns = wire.filter((w) => w.event === 'spawn');
  const metaKeys = [...new Set(sent.filter((m) => m.method?.startsWith('tools/')).flatMap((m) => Object.keys(m.params?._meta ?? {})))];
  Object.assign(report, {
    methods_sent: methods,
    per_request_meta_keys: metaKeys,
    per_request_protocol_versions: [
      ...new Set(sent.filter((m) => m.method?.startsWith('tools/')).flatMap((m) => Object.entries(m.params?._meta ?? {}).filter(([k]) => k.toLowerCase().includes('protocolversion')).map(([, v]) => v))),
    ],
    server_processes: spawns.length,
    stdout_protocol_only: stdoutClean,
    stdout_lines: received.length,
    exit_events: exits.map((e) => ({ code: e.code, signal: e.signal })),
    clean_shutdown: exits.length === spawns.length && exits.every((e) => e.code === 0 || e.signal === 'SIGTERM'),
    stderr: tidy(stderr.join('')).slice(0, 2000),
  });
  check(defects, stdoutClean, 'stdout carried something other than JSON-RPC messages');
  check(defects, report.clean_shutdown, `server did not shut down cleanly: ${JSON.stringify(report.exit_events)} for ${spawns.length} process(es)`);
  for (const method of ['tools/list', 'tools/call']) check(defects, methods.includes(method), `${method} was not observed on the wire`);
  if (mode === 'legacy') {
    check(defects, methods.includes('initialize'), 'legacy: initialize was not observed');
    check(defects, !methods.includes('server/discover'), 'legacy: server/discover was sent');
    check(defects, report.observed_era === 'legacy' || report.observed_era === null || String(report.observed_revision).startsWith('2025'), `legacy: unexpected era ${report.observed_era} ${report.observed_revision}`);
  } else {
    check(defects, methods.includes('server/discover'), 'modern: server/discover was not observed');
    check(defects, !methods.includes('initialize'), 'modern: fell back to initialize');
    check(defects, report.observed_revision === MODERN_REVISION, `modern: negotiated ${report.observed_revision}, expected ${MODERN_REVISION}`);
    check(defects, report.per_request_protocol_versions.includes(MODERN_REVISION), 'modern: per-request protocol version metadata was not observed');
  }
  report.defects = defects;
  report.pass = defects.length === 0;
  return report;
}

function coverage(eras) {
  const calls = eras.flatMap((e) => e.calls);
  const statusOf = (tool, test = () => true) => [...new Set(calls.filter((c) => c.tool === tool && test(c)).map((c) => c.status))];
  const hosts = (name) => calls.filter((c) => (c.sources ?? []).some((s) => s.url.includes(name)));
  const cheats = calls.find((c) => c.tool === 'list_cheats' && c.arguments.include_unverified && c.status);
  const fandomOff = calls.some((c) => (c.notices ?? []).some((n) => n.message.includes('GTA6_MCP_FANDOM_PERMISSION')));
  const confirmed = Number(/^(\d+) confirmed/.exec(cheats?.summary ?? '')?.[1] ?? NaN);
  return {
    provider_statuses: {
      'gta.wiki': 'never requested: its host requires prior consent for automated use',
      'gta.fandom.com': fandomOff ? 'not permitted: permission is not recorded, so no request was made' : hosts('gta.fandom.com').length > 0 ? 'reachable' : 'no successful retrieval',
      'en.wikipedia.org': hosts('en.wikipedia.org').length > 0 ? 'reachable' : 'no successful retrieval',
    },
    gameplay_coverage: {
      confirmed_cheats: Number.isNaN(confirmed) ? 'unverified' : confirmed,
      reported_rows_returned: cheats?.result_count ?? 'unverified',
      cheat_statuses: statusOf('list_cheats'),
      easter_egg_statuses: statusOf('easter_eggs'),
      page_statuses: statusOf('get_page'),
      search_statuses: statusOf('search_gta6'),
    },
  };
}

const eras = [await runEra('legacy', 'legacy'), await runEra('modern', { pin: MODERN_REVISION })];
const versionOf = (pkg) => JSON.parse(readFileSync(join(root, 'node_modules', pkg, 'package.json'), 'utf8')).version;
const report = {
  generated_at: new Date().toISOString(),
  tested_sha: flag('--sha') ?? tryExec('git', ['rev-parse', 'HEAD']) ?? 'unknown',
  launcher: tidy(launcher.join(' ')),
  versions: {
    node: process.version,
    npm: tryExec('npm', ['--version']),
    '@modelcontextprotocol/client': versionOf('@modelcontextprotocol/client'),
    '@modelcontextprotocol/server (repo checkout)': versionOf('@modelcontextprotocol/server'),
  },
  legacy_protocol_pass: eras[0].pass,
  modern_protocol_pass: eras[1].pass,
  ...coverage(eras),
  eras,
};
report.exit_code = report.legacy_protocol_pass && report.modern_protocol_pass ? 0 : 1;
const out = flag('--out');
if (out) writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, eras: eras.map(({ calls, ...rest }) => ({ ...rest, calls: calls.map(({ first_result, sources, ...c }) => c) })) }, null, 2));
process.exit(report.exit_code);
