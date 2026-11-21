#!/usr/bin/env node
// Wire recorder: runs a stdio MCP server and logs every line in both directions.
// Usage: node scripts/tee.mjs <logfile> -- <command> [args...]
// The wrapped server's stdout still reaches the client untouched.
import { spawn } from 'node:child_process';
import { homedir } from 'node:os';
import { appendFileSync } from 'node:fs';

const [logFile, separator, command, ...args] = process.argv.slice(2);
if (!logFile || separator !== '--' || !command) {
  console.error('usage: node scripts/tee.mjs <logfile> -- <command> [args...]');
  process.exit(2);
}

const child = spawn(command, args, { stdio: ['pipe', 'pipe', 'inherit'] });
const record = (entry) => appendFileSync(logFile, `${JSON.stringify({ at: new Date().toISOString(), wrapper_pid: process.pid, ...entry })}\n`);
// Logs are published, so the home directory is reduced to a placeholder.
record({ event: 'spawn', command: [command, ...args].join(' ').replaceAll(homedir(), '~') });

function tap(stream, direction, forward) {
  let buffer = '';
  stream.on('data', (chunk) => {
    forward.write(chunk);
    buffer += chunk.toString('utf8');
    let newline = buffer.indexOf('\n');
    while (newline >= 0) {
      const line = buffer.slice(0, newline);
      buffer = buffer.slice(newline + 1);
      if (line.trim() !== '') record({ direction, line });
      newline = buffer.indexOf('\n');
    }
  });
}

tap(process.stdin, 'client_to_server', child.stdin);
tap(child.stdout, 'server_to_client', process.stdout);
process.stdin.on('end', () => child.stdin.end());
// A client may end a probe process with a signal instead of closing stdin.
for (const signal of ['SIGTERM', 'SIGINT', 'SIGHUP']) {
  process.on(signal, () => {
    record({ event: 'signal', signal });
    child.kill(signal);
  });
}
child.on('exit', (code, signal) => {
  record({ event: 'exit', code, signal });
  process.exit(code ?? 0);
});
