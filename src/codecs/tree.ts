import {toTree} from 'json-joy/lib/json-text/toTree';
import type {CliCodec} from '../types';

export class CliCodecTree implements CliCodec<'tree'> {
  public readonly id = 'tree';
  public readonly description = 'Formatted JSON tree';

  encode(value: unknown): Uint8Array {
    const str = toTree(value);
    return new TextEncoder().encode(str + '\n');
  }

  decode(bytes: Uint8Array): unknown {
    throw new Error('Not implemented');
  }
}
