import {BsonDecoder} from '@jsonjoy.com/json-pack/lib/bson/BsonDecoder';
import {BsonEncoder} from '@jsonjoy.com/json-pack/lib/bson/BsonEncoder';
import type {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';
import type {CliCodec} from '../types';

export class CliCodecBson implements CliCodec<'bson'> {
  public readonly id = 'bson';
  public readonly description = 'BSON: MongoDB binary format';
  protected readonly encoder: BsonEncoder;
  protected readonly decoder: BsonDecoder;

  constructor(protected readonly writer: Writer) {
    this.encoder = new BsonEncoder(writer);
    this.decoder = new BsonDecoder();
  }

  encode(value: unknown): Uint8Array {
    return this.encoder.encode(value);
  }

  decode(bytes: Uint8Array): unknown {
    return this.decoder.read(bytes);
  }
}