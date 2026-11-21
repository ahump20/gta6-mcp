#!/usr/bin/env node
// Wire recorder: runs a stdio MCP server and logs every line in both directions.
// Usage: node scripts/tee.mjs <logfile> -- <command> [args...]
// The wrapped server's stdout still reaches the client untouched.
import { spawn } from 'node:child_process';
import { homedir } from 'node:os';
import { appendFileSync, realpathSync } from 'node:fs';
import { StringDecoder } from 'node:string_decoder';
import { fileURLToPath } from 'node:url';

/** How long the recorder waits for the child's output to end after the child has exited. */
const LINGER_MS = 1000;

/** Splits a byte stream into lines. A character split across chunks stays whole, and end() emits a last line that has no newline. */
export function lineSplitter(onLine) {
  const decoder = new StringDecoder('utf8');
  let buffer = '';
  const feed = (text) => {
    const lines = `${buffer}${text}`.split('\n');
    buffer = lines.pop() ?? '';
    lines.forEach(onLine);
  };
  return {
    write: (chunk) => feed(decoder.write(chunk)),
    end: () => {
      feed(decoder.end());
      if (buffer !== '') onLine(buffer);
      buffer = '';
    },
  };
}

// Importing this file, as the tests do, must not start a server.
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) main();

function main() {
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
    const lines = lineSplitter((line) => {
      if (line.trim() !== '') record({ direction, line });
    });
    stream.on('data', (chunk) => {
      forward.write(chunk);
      lines.write(chunk);
    });
    stream.on('end', () => lines.end());
    return lines;
  }

  const taps = [tap(process.stdin, 'client_to_server', child.stdin), tap(child.stdout, 'server_to_client', process.stdout)];
  process.stdin.on('end', () => child.stdin.end());
  // A client may end a probe process with a signal instead of closing stdin.
  for (const signal of ['SIGTERM', 'SIGINT', 'SIGHUP']) {
    process.on(signal, () => {
      record({ event: 'signal', signal });
      child.kill(signal);
    });
  }
  let finished = false;
  const finish = (code, signal) => {
    if (finished) return;
    finished = true;
    // A stream that never ended may still hold a last line with no newline.
    for (const lines of taps) lines.end();
    record({ event: 'exit', code, signal });
    process.exit(code ?? 0);
  };
  // "close" follows the end of the child's stdout, so its last line is recorded before the exit.
  child.on('close', finish);
  // Something the child started (npx starts the server) can outlive it and hold stdout open, so "close" may never come.
  child.on('exit', (code, signal) => {
    child.stdin.end();
    setTimeout(() => finish(code, signal), LINGER_MS).unref();
  });
}
