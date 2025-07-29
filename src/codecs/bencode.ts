import {BencodeDecoder} from '@jsonjoy.com/json-pack/lib/bencode/BencodeDecoder';
import {BencodeEncoder} from '@jsonjoy.com/json-pack/lib/bencode/BencodeEncoder';
import type {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';
import type {CliCodec} from '../types';

export class CliCodecBencode implements CliCodec<'bencode'> {
  public readonly id = 'bencode';
  public readonly description = 'Bencode: Bittorrent serialization format';
  protected readonly encoder: BencodeEncoder;
  protected readonly decoder: BencodeDecoder;

  constructor(protected readonly writer: Writer) {
    this.encoder = new BencodeEncoder(writer);
    this.decoder = new BencodeDecoder();
  }

  encode(value: unknown): Uint8Array {
    return this.encoder.encode(value);
  }

  decode(bytes: Uint8Array): unknown {
    return this.decoder.read(bytes);
  }
}