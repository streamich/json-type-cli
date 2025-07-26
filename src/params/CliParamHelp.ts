import type {Cli} from '../Cli';
import type {CliParam, CliParamInstance} from '../types';

const bold = (text: string) => `\u001b[1m${text}\u001b[0m`;

export class CliParamHelp implements CliParam {
  public readonly param = 'help';
  public readonly short = 'h';
  public readonly title = 'Print help and exit';
  public readonly createInstance = (cli: Cli, pointer: string, value: unknown) =>
    new (class implements CliParamInstance {
      public readonly onParam = async () => {
        const paramLines = cli.params.map((param) => {
          let line = bold(`--${param.param}`);
          if (param.short) line += ` or ${bold(`--${param.short}`)}`;
          line += ` - ${param.title}`;
          if (param.example) line += `, eg. ${param.example}`;
          return line;
        });
        const methods: string[] = cli.router.keys().sort();
        const methodLines = methods.map((m) => {
          const route = cli.router.get(m).type;
          const schema = route.getSchema();
          let line = '* ' + bold(m);
          if (schema.title) line += ` - ${schema.title}`;
          return line;
        });
        const cmd = bold(cli.cmd());
        const codecLines = [...cli.codecs.codecs.values()].map((codec) => `* ${bold(codec.id)} - ${codec.description}`);
        const text = `
JSON Type CLI uses request/response paradigm to execute CLI commands. Each
command is identified by the <method> name. Each command receives a JSON
object as the request payload and returns a JSON object as a response.

Request payload is composed from the following sources: (1) command line
second parameter; (2) STDIN input; (3) command line options.

Response object is returned to STDOUT. A part of it can be extracted using
the "--stdout" or "--out" option.

Usage:

    ${cmd} <method> '<json>'
    ${cmd} <method> --<type><pointer>=<value>
    echo '<json>' | ${cmd} <method>

Method help:

    ${cmd} .methods
    ${cmd} .method --s/name=<method>
    ${cmd} .type --out=/<method>
    ${cmd} .type --out=/<method>/description
    ${cmd} .type --out=/<method>/req
    ${cmd} .type --out=/<method>/res --format=tree

Examples:

    ${cmd} .echo '{ "foo": 123 }'
    ${cmd} .echo --num/value=123
    ${cmd} .echo --json/value='{ "foo": 123 }' --out=/value
    echo '{ "foo": 123 }' | ${cmd} .echo
    ${cmd} .echo --s/foo=bar --format=cbor
    cat data.cbor | ${cmd} .echo --format=cbor:json
    ${cmd} .echo '{"foo": 123}' --f=cbor | ${cmd} .echo --f=cbor:tree

Options:

    ${paramLines.join('\n    ')}

Formats:

    ${codecLines.join('\n    ')}

Methods:

    ${methodLines.join('\n    ')}

  `;
        cli.stdout.write(text);
        cli.exit(0);
      };
    })();
}
