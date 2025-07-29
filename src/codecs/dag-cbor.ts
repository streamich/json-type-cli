import {CborDecoderDag} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoderDag';
import {CborEncoderDag} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoderDag';
import type {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';
import type {CliCodec} from '../types';

export class CliCodecDagCbor implements CliCodec<'dag-cbor'> {
  public readonly id = 'dag-cbor';
  public readonly description = 'DAG-CBOR: deterministic CBOR codec';
  protected readonly encoder: CborEncoderDag;
  protected readonly decoder: CborDecoderDag;

  constructor(protected readonly writer: Writer) {
    this.encoder = new CborEncoderDag(writer);
    this.decoder = new CborDecoderDag();
  }

  encode(value: unknown): Uint8Array {
    return this.encoder.encode(value);
  }

  decode(bytes: Uint8Array): unknown {
    return this.decoder.read(bytes);
  }
}