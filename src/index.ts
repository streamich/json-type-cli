import {defaultCodecs} from './defaultCodecs';
import {Cli, type CliOptions} from './Cli';
import type {ObjectValue} from '@jsonjoy.com/json-type/lib/value/ObjectValue';

export const createCli = <Router extends ObjectValue<any>>(options: Partial<CliOptions<Router>>) => {
  const cli = new Cli<Router>({
    codecs: defaultCodecs,
    ...options,
  });
  return cli;
};
