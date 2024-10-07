import {applyPatch} from 'json-joy/lib/json-patch';
import {toPath} from '@jsonjoy.com/json-pointer';
import type {Cli} from '../Cli';
import type {CliParam, CliParamInstance} from '../types';

export class CliParamUnd implements CliParam {
  public readonly param = 'und';
  public readonly title = 'Set undefined value';
  public readonly createInstance = (cli: Cli, pointer: string, rawValue: unknown) =>
    new (class implements CliParamInstance {
      public readonly onRequest = async () => {
        const path = toPath(pointer);
        cli.request = applyPatch(cli.request, [{op: 'add', path, value: undefined}], {mutate: true}).doc;
      };
    })();
}
