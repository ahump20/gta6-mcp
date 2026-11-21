import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

interface Splitter {
  write(chunk: Buffer): void;
  end(): void;
}

// The recorder is a plain script outside the TypeScript project, so it is loaded by path.
const script = new URL('../scripts/tee.mjs', import.meta.url).href;
const { lineSplitter } = (await import(script)) as { lineSplitter: (onLine: (line: string) => void) => Splitter };

function collect(chunks: readonly Buffer[]): string[] {
  const lines: string[] = [];
  const splitter = lineSplitter((line) => lines.push(line));
  for (const chunk of chunks) splitter.write(chunk);
  splitter.end();
  return lines;
}

describe('wire recorder line splitting', () => {
  it('keeps a multi-byte character that is split across chunks', () => {
    const bytes = Buffer.from('a€b\n', 'utf8');
    const SPLIT_INSIDE_EURO = 2;
    expect(collect([bytes.subarray(0, SPLIT_INSIDE_EURO), bytes.subarray(SPLIT_INSIDE_EURO)])).toEqual(['a€b']);
  });

  it('emits a final line that has no newline', () => {
    expect(collect([Buffer.from('one\ntw'), Buffer.from('o')])).toEqual(['one', 'two']);
  });

  it('emits nothing extra when the stream ends on a newline', () => {
    expect(collect([Buffer.from('one\n')])).toEqual(['one']);
  });
});

describe('wire recorder shutdown', () => {
  const GIVE_UP_MS = 10_000;

  it('exits once the server has gone, even while something the server started still holds its output open, and keeps its last line', () => {
    const log = join(mkdtempSync(join(tmpdir(), 'gta6-tee-')), 'wire.jsonl');
    // The shell exits at once; the sleep it leaves behind keeps the shell's stdout open.
    const run = spawnSync(process.execPath, [fileURLToPath(script), log, '--', 'sh', '-c', 'printf lastline; sleep 15 & exit 0'], {
      input: '',
      stdio: ['pipe', 'pipe', 'ignore'],
      timeout: GIVE_UP_MS,
    });
    expect(run.error).toBeUndefined();
    expect(run.status).toBe(0);
    const recorded = readFileSync(log, 'utf8');
    expect(recorded).toContain('"line":"lastline"');
    expect(recorded.indexOf('"line":"lastline"')).toBeLessThan(recorded.indexOf('"event":"exit"'));
  }, GIVE_UP_MS * 2);
});
