import {RespDecoder} from '@jsonjoy.com/json-pack/lib/resp/RespDecoder';
import {RespEncoder} from '@jsonjoy.com/json-pack/lib/resp/RespEncoder';
import type {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';
import type {CliCodec} from '../types';

export class CliCodecResp implements CliCodec<'resp'> {
  public readonly id = 'resp';
  public readonly description = 'RESP3: Redis serialization format';
  protected readonly encoder: RespEncoder;
  protected readonly decoder: RespDecoder;

  constructor(protected readonly writer: Writer) {
    this.encoder = new RespEncoder(writer);
    this.decoder = new RespDecoder();
  }

  encode(value: unknown): Uint8Array {
    return this.encoder.encode(value);
  }

  decode(bytes: Uint8Array): unknown {
    return this.decoder.read(bytes);
  }
}
