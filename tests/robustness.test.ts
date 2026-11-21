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
