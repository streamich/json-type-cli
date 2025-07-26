import type {CliCodec} from '../types';

export class CliCodecHex implements CliCodec<'hex'> {
  public readonly id = 'hex';
  public readonly description = 'Same as "raw", but encodes binary data as HEX octets';

  encode(value: unknown): Uint8Array {
    const buf = value instanceof Uint8Array ? value : new TextEncoder().encode(String(value));
    const hex = Array.from(buf)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join(' ');
    return new TextEncoder().encode(hex + '\n');
  }

  decode(bytes: Uint8Array): unknown {
    throw new Error('Not available');
  }
}
