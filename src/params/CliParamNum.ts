import {applyPatch} from 'json-joy/lib/json-patch';
import {toPath} from '@jsonjoy.com/json-pointer';
import type {Cli} from '../Cli';
import type {CliParam, CliParamInstance} from '../types';

export class CliParamNum implements CliParam {
  public readonly param = 'num';
  public readonly short = 'n';
  public readonly title = 'Set number value';
  public readonly example = '--n/foo=123';
  public readonly createInstance = (cli: Cli, pointer: string, rawValue: unknown) =>
    new (class implements CliParamInstance {
      public readonly onRequest = async () => {
        const value = Number(JSON.parse(String(rawValue)));
        const path = toPath(pointer);
        cli.request = applyPatch(cli.request, [{op: 'add', path, value}], {mutate: true}).doc;
      };
    })();
}
