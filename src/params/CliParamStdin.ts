import {applyPatch} from 'json-joy/lib/json-patch';
import {find, toPath, validateJsonPointer} from '@jsonjoy.com/json-pointer';
import type {Cli} from '../Cli';
import type {CliParam, CliParamInstance} from '../types';

export class CliParamStdin implements CliParam {
  public readonly param = 'stdin';
  public readonly short = 'in';
  public readonly title = 'Read data from STDIN';
  public readonly example = '--in or --in/to=/from';
  public readonly createInstance = (cli: Cli, pointer: string, rawValue: unknown) => {
    if (rawValue === true) rawValue = '';
    return new (class implements CliParamInstance {
      public readonly onStdin = async () => {
        const fromPointer = String(rawValue);
        validateJsonPointer(fromPointer);
        validateJsonPointer(pointer);
        const from = toPath(fromPointer);
        const path = toPath(pointer);
        const value = find(cli.stdinInput, from).val;
        cli.request = applyPatch(cli.request, [{op: 'add', path, value}], {mutate: true}).doc;
      };
    })();
  };
}
