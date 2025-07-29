import {JsonDecoderDag} from '@jsonjoy.com/json-pack/lib/json/JsonDecoderDag';
import {JsonEncoderDag} from '@jsonjoy.com/json-pack/lib/json/JsonEncoderDag';
import type {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';
import type {CliCodec} from '../types';

export class CliCodecDagJson implements CliCodec<'dag-json'> {
  public readonly id = 'dag-json';
  public readonly description = 'DAG-JSON: deterministic JSON codec';
  protected readonly encoder: JsonEncoderDag;
  protected readonly decoder: JsonDecoderDag;

  constructor(protected readonly writer: Writer) {
    this.encoder = new JsonEncoderDag(writer);
    this.decoder = new JsonDecoderDag();
  }

  encode(value: unknown): Uint8Array {
    return this.encoder.encode(value);
  }

  decode(bytes: Uint8Array): unknown {
    return this.decoder.read(bytes);
  }
}