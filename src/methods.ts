import type {CliContext} from './types';
import type {ObjectType} from '@jsonjoy.com/json-type';
import type {ObjectValue} from '@jsonjoy.com/json-type/lib/value/ObjectValue';

export const defineBuiltinRoutes = <Routes extends ObjectType<any>>(r: ObjectValue<Routes>) => {
  return r.extend((t, r) => [
    r(
      '.echo',
      t.Function(t.any, t.any).options({
        title: 'Echo input',
        description: 'Echo the input value back to the caller',
      }),
      async (req) => req,
    ),

    r(
      '.type',
      t.Function(t.undef, t.any).options({
        title: 'Type information',
        description: 'Returns whole type system of this CLI.',
      }),
      async (request, ctx) => {
        return (ctx as CliContext).cli.types.exportTypes();
      },
    ),

    r(
      '.info',
      t.Function(t.undef, t.any).options({
        title: 'CLI information',
        description: 'Returns whole information about this CLI.',
      }),
      async (request, ctx) => {
        return {
          version: (ctx as CliContext).cli.options.version,
          cmd: (ctx as CliContext).cli.options.cmd,
        };
      },
    ),

    r(
      '.methods',
      t.Function(t.undef, t.Array(t.str)).options({
        title: 'List all CLI methods',
        description: 'Returns a list of all methods available in this CLI.',
      }),
      async (request, ctx) => {
        const list = (ctx as CliContext).cli.router.keys();
        return list;
      },
    ),

    r(
      '.method',
      t.Function(t.Object(
        t.prop('name', t.str)
      ), t.any).options({
        title: 'Show method information',
        description: 'Returns JSON Type schema of the method.',
      }),
      async (request, ctx) => {
        const name = request.name;
        const method = (ctx as CliContext).cli.router.get(name);
        if (!method) throw new Error(`Unknown method "${name}"`);
        return method.type.getSchema();
      },
    ),
  ]);
};
