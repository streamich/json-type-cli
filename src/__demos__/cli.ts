// npx ts-node src/__demos__/cli.ts

import {createCli} from '..';
import {ObjectValue} from '@jsonjoy.com/json-type/lib/value/ObjectValue';
import {defineCrdtRoutes} from './routes/crdt';
import {definePatchRoutes} from './routes/patch';
import {defineUtilRoutes} from './routes/util';

// prettier-ignore
const router =
  ( definePatchRoutes
  ( defineCrdtRoutes
  ( defineUtilRoutes
  ( ObjectValue.create()))));

const cli = createCli({
  router,
  version: 'v' + require('../../package.json').version,
  cmd: 'test-cli',
});

cli.run();
