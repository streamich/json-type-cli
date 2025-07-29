import {EjsonDecoder} from '@jsonjoy.com/json-pack/lib/ejson/EjsonDecoder';
import {EjsonEncoder} from '@jsonjoy.com/json-pack/lib/ejson/EjsonEncoder';
import type {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';
import type {CliCodec} from '../types';

export class CliCodecEjson implements CliCodec<'ejson'> {
  public readonly id = 'ejson';
  public readonly description = 'EJSON v2: MongoDB text variant of BSON';
  protected readonly encoder: EjsonEncoder;
  protected readonly decoder: EjsonDecoder;

  constructor(protected readonly writer: Writer) {
    this.encoder = new EjsonEncoder(writer);
    this.decoder = new EjsonDecoder();
  }

  encode(value: unknown): Uint8Array {
    return this.encoder.encode(value);
  }

  decode(bytes: Uint8Array): unknown {
    return this.decoder.read(bytes);
  }
}