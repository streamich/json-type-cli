import {toLine} from 'pojo-dump/lib/toLine';
import type {CliCodec} from '../types';

export class CliCodecText implements CliCodec<'text'> {
  public readonly id = 'text';
  public readonly description = 'Human-readalbe single-line representation of the JSON object';

  encode(value: unknown): Uint8Array {
    const str = toLine(value);
    return new TextEncoder().encode(str + '\n');
  }

  decode(bytes: Uint8Array): unknown {
    throw new Error('Not implemented');
  }
}
