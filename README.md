# JSON Type CLI

JSON Type CLI is a powerful Node.js package for building command-line interface (CLI) utilities that implement the JSON Rx RPC protocol. It uses JSON as the primary data format and provides request/response communication pattern where each CLI interaction is a request that produces a response.

## Overview

This package enables you to build type-safe CLI tools where:
- Each CLI command is a **method** with typed input/output schemas
- Input data forms the **request** payload (following JSON Rx RPC)
- Output data is the **response** payload 
- Multiple input sources can be composed together
- Multiple output formats are supported (JSON, CBOR, MessagePack, etc.)

The library implements the **JSON Rx RPC protocol**, where each CLI interaction follows the request/response pattern. You define methods with typed schemas using the JSON Type system, and the CLI handles parsing, validation, method calling, and response formatting automatically.

## Quick Start

### Installation

```bash
npm install @jsonjoy.com/json-type-cli
```

### Basic Usage

```typescript
import { createCli } from '@jsonjoy.com/json-type-cli';
import { ObjectValue } from '@jsonjoy.com/json-type/lib/value/ObjectValue';

// Create a router with your methods
const router = ObjectValue.create()
  .prop('greet', 
    t.Function(
      t.Object(t.prop('name', t.str)),  // Request schema
      t.Object(t.prop('message', t.str)) // Response schema
    ).options({
      title: 'Greet a person',
      description: 'Returns a greeting message for the given name'
    }),
    async ({ name }) => ({ 
      message: `Hello, ${name}!` 
    })
  );

// Create and run CLI
const cli = createCli({
  router,
  version: 'v1.0.0',
  cmd: 'my-cli'
});

cli.run();
```

Save this as `my-cli.js` and run:

```bash
node my-cli.js greet '{"name": "World"}'
# Output: {"message": "Hello, World!"}

node my-cli.js greet --str/name=Alice  
# Output: {"message": "Hello, Alice!"}
```

## JSON Rx RPC Protocol Implementation

This CLI tool implements the JSON Rx RPC protocol with the following characteristics:

### Request/Response Pattern
- Each CLI command is a **method call** in JSON Rx RPC terms
- The method name is the first positional argument: `my-cli <method> ...`
- Request data is composed from multiple sources (see [Input Sources](#input-sources))
- Response data is returned to STDOUT in the specified format

### JSON Rx RPC Message Flow
1. **Request Composition**: CLI parses arguments and builds request payload
2. **Method Invocation**: Calls the specified method with the request data
3. **Response Generation**: Method returns response payload  
4. **Response Encoding**: Encodes response in the specified format (JSON, CBOR, etc.)

This follows the JSON Rx RPC **Request Complete** message pattern where the client (CLI) sends a complete request and receives a complete response.

## Building CLI Tools

### Defining Methods

Methods are defined using the JSON Type system and added to a router:

```typescript
import { createCli } from '@jsonjoy.com/json-type-cli';
import { ObjectValue } from '@jsonjoy.com/json-type/lib/value/ObjectValue';

const router = ObjectValue.create();
const { t } = router;

// Simple echo method
router.prop('echo', 
  t.Function(t.any, t.any).options({
    title: 'Echo input',
    description: 'Returns the input unchanged'
  }),
  async (input) => input
);

// Math operations
router.prop('math.add',
  t.Function(
    t.Object(
      t.prop('a', t.num),
      t.prop('b', t.num)
    ),
    t.Object(t.prop('result', t.num))
  ).options({
    title: 'Add two numbers',
    description: 'Adds two numbers and returns the result'
  }),
  async ({ a, b }) => ({ result: a + b })
);

// File processing
router.prop('file.process',
  t.Function(
    t.Object(
      t.prop('filename', t.str),
      t.propOpt('encoding', t.str)
    ),
    t.Object(
      t.prop('size', t.num),
      t.prop('content', t.str)
    )
  ).options({
    title: 'Process a file',
    description: 'Reads and processes a file'
  }),
  async ({ filename, encoding = 'utf8' }) => {
    const fs = require('fs');
    const content = fs.readFileSync(filename, encoding);
    return {
      size: content.length,
      content: content
    };
  }
);
```

### Organizing Routes

For larger applications, organize routes into modules:

```typescript
// routes/user.ts
export const defineUserRoutes = <Routes extends ObjectType<any>>(r: ObjectValue<Routes>) => {
  return r.extend((t, r) => [
    r('user.create',
      t.Function(
        t.Object(
          t.prop('name', t.str),
          t.prop('email', t.str)
        ),
        t.Object(
          t.prop('id', t.str),
          t.prop('name', t.str),
          t.prop('email', t.str)
        )
      ).options({
        title: 'Create a user',
        description: 'Creates a new user account'
      }),
      async ({ name, email }) => ({
        id: generateId(),
        name,
        email
      })
    ),

    r('user.get',
      t.Function(
        t.Object(t.prop('id', t.str)),
        t.Object(
          t.prop('id', t.str),
          t.prop('name', t.str),
          t.prop('email', t.str)
        )
      ).options({
        title: 'Get user by ID',
        description: 'Retrieves user information by ID'
      }),
      async ({ id }) => getUserById(id)
    )
  ]);
};

// main.ts
import { defineUserRoutes } from './routes/user';

const router = defineUserRoutes(ObjectValue.create());
const cli = createCli({ router });
```

## Input Sources (Request Composition)

The CLI composes request data from three sources in this priority order:

### 1. Command Line JSON Parameter

Provide JSON directly as the second argument:

```bash
my-cli greet '{"name": "Alice", "age": 30}'
my-cli math.add '{"a": 5, "b": 3}'
```

### 2. STDIN Input

Pipe JSON data to the CLI:

```bash
echo '{"name": "Bob"}' | my-cli greet
cat user.json | my-cli user.create
curl -s api.example.com/data.json | my-cli process.data
```

### 3. Command Line Options

Use typed parameters to build the request object:

```bash
# String values
my-cli greet --str/name=Alice --str/title="Ms."

# Numeric values  
my-cli math.add --num/a=10 --num/b=20

# Boolean values
my-cli user.update --bool/active=true --bool/verified=false

# JSON values
my-cli config.set --json/settings='{"theme": "dark", "lang": "en"}'

# Nested paths using JSON Pointer
my-cli user.update --str/profile/name="Alice" --num/profile/age=25
```

### Combining Input Sources

All sources can be combined. Command line options override STDIN data, which overrides the JSON parameter:

```bash
echo '{"name": "Default", "age": 0}' | my-cli greet '{"name": "Alice"}' --num/age=30
# Result: {"name": "Alice", "age": 30}
```

## Output Formats (Response Encoding)

### Supported Codecs

The CLI supports multiple output formats through codecs:

| Codec | Description | Use Case |
|-------|-------------|----------|
| `json` | Standard JSON (default) | Human-readable, web APIs |
| `json2` | Pretty JSON (2 spaces) | Development, debugging |
| `json4` | Pretty JSON (4 spaces) | Documentation, config files |
| `cbor` | CBOR binary format | Compact binary, IoT |
| `msgpack` | MessagePack binary | High performance, caching |
| `ubjson` | Universal Binary JSON | Cross-platform binary |
| `text` | Formatted text output | Human-readable reports |
| `tree` | Tree visualization | Debugging, data exploration |
| `raw` | Raw data output | Binary data, strings |

### Using Output Formats

```bash
# Default JSON output
my-cli user.get '{"id": "123"}'

# Pretty-printed JSON
my-cli user.get '{"id": "123"}' --format=json4

# Binary formats
my-cli data.export --format=cbor > data.cbor
my-cli data.export --format=msgpack > data.msgpack

# Text visualization  
my-cli config.get --format=tree
my-cli config.get --format=text

# Different input/output formats
cat data.cbor | my-cli process.data --format=cbor:json
echo '{"test": 123}' | my-cli echo --format=json:tree
```

### Extracting Response Data

Use the `--stdout` or `--out` parameter to extract specific parts of the response:

```bash
# Extract specific field
my-cli user.get '{"id": "123"}' --out=/user/name

# Extract nested data
my-cli api.fetch '{"url": "example.com"}' --out=/response/data/items

# Combine with format conversion
my-cli data.complex --out=/results/summary --format=json:text
```

## Command Line Parameters

### Data Type Parameters

#### String Values (`--str` or `--s`)
```bash
my-cli greet --str/name=Alice
my-cli config.set --s/database/host=localhost --s/database/name=mydb
```

#### Numeric Values (`--num` or `--n`)
```bash
my-cli math.add --num/a=10 --num/b=20
my-cli server.start --n/port=3000 --n/workers=4
```

#### Boolean Values (`--bool` or `--b`)
```bash
my-cli user.update --bool/active=true
my-cli feature.toggle --b/enabled=false
```

#### JSON Values (`--json` or `--j`)
```bash
my-cli config.merge --json/settings='{"theme": "dark"}'
my-cli api.call --j/payload='[1,2,3]'  
```

#### Undefined Values (`--und`)
```bash
my-cli optional.field --und/optionalParam
```

### File Input (`--file` or `--f`)

Read values from files with optional format and path extraction:

```bash
# Read JSON file
my-cli process.data --file/input=data.json

# Read with specific codec
my-cli import.data --f/data=data.cbor:cbor

# Extract path from file  
my-cli user.create --f/profile=user.json:json:/personalInfo

# Chain: file -> codec -> path
my-cli complex.import --f/config=settings.msgpack:msgpack:/database/credentials
```

### Command Execution (`--cmd` or `--c`)

Execute commands and use their output as values:

```bash
# Use command output as string
my-cli log.write --cmd/message='(echo "Current time: $(date)"):text'

# Use command output as JSON
my-cli api.send --c/data='(curl -s api.example.com/data):json'

# Extract path from command output
my-cli process.status --c/info='(ps aux | grep node):json:/0/pid'
```

### Format Control (`--format` or `--fmt`)

Control input and output encoding:

```bash
# Single format (for both input and output)  
my-cli echo --format=cbor

# Separate input and output formats
my-cli convert --format=cbor:json
my-cli transform --fmt=json:tree
```

### STDIN Control (`--stdin` or `--in`)

Explicitly control STDIN data mapping:

```bash
# Use all STDIN data
echo '{"name": "Alice"}' | my-cli greet --stdin

# Map STDIN to specific path
echo '{"users": [...]}' | my-cli process.users --in/data=/users

# Map with path extraction
echo '{"response": {"users": [...]}}' | my-cli save.users --in/users=/response/users
```

### Output Control (`--stdout` or `--out`)

Extract specific parts of the response:

```bash
# Extract single field
my-cli user.get '{"id": "123"}' --out=/name

# Extract nested object
my-cli api.fetch --out=/response/data

# Use with format conversion
my-cli complex.data --out=/results --format=json:tree
```

### Utility Parameters

#### Help (`--help` or `--h`)
```bash
my-cli --help                    # General help
my-cli method.name --help        # Method-specific help  
```

#### Version (`--version` or `--v`)
```bash
my-cli --version
```

#### Execution Plan (`--plan`)
```bash
my-cli complex.operation --plan  # Show what would be executed
```

## Advanced Features

### Type Introspection

Get information about available methods and their schemas:

```bash
# List all methods
my-cli .type

# Get method schema
my-cli .type --out=/methodName
my-cli .type --out=/user.create/req --format=tree
my-cli .type --out=/user.create/res --format=json4
```

### Binary Data Handling

The CLI supports binary data through various codecs:

```bash
# Process binary data
cat image.jpg | my-cli image.process --format=raw:json

# Convert between binary formats  
cat data.cbor | my-cli convert --format=cbor:msgpack > data.msgpack

# Encode JSON as binary
my-cli data.export '{"large": "dataset"}' --format=json:cbor > export.cbor
```

### Error Handling

Errors follow JSON Rx RPC error format and are sent to STDERR:

```bash
my-cli invalid.method 2>errors.log
my-cli user.get '{"invalid": "data"}' 2>validation-errors.json
```

Error objects include:
- `message`: Human-readable error description
- `code`: Stable error code for programmatic handling  
- `errno`: Numeric error code
- `errorId`: Unique error identifier for logging
- `meta`: Additional error metadata (stack traces, etc.)

### Performance Optimization

For high-performance scenarios:

```bash
# Use binary formats for large data
my-cli large.dataset --format=msgpack

# Use raw format for simple string/binary output  
my-cli get.file.content --format=raw

# Stream processing with STDIN/STDOUT
cat large-file.json | my-cli process.stream --format=json:cbor | my-cli save.processed --format=cbor
```

## Complete Example

Here's a complete example building a file processing CLI:

```typescript
import { createCli } from '@jsonjoy.com/json-type-cli';
import { ObjectValue } from '@jsonjoy.com/json-type/lib/value/ObjectValue';
import * as fs from 'fs';
import * as path from 'path';

const router = ObjectValue.create();
const { t } = router;

// File operations
router
  .prop('file.read',
    t.Function(
      t.Object(
        t.prop('path', t.str),
        t.propOpt('encoding', t.str)
      ),
      t.Object(
        t.prop('content', t.str),
        t.prop('size', t.num)
      )
    ).options({
      title: 'Read file content',
      description: 'Reads a file and returns its content and size'
    }),
    async ({ path: filePath, encoding = 'utf8' }) => {
      const content = fs.readFileSync(filePath, encoding);
      return {
        content,
        size: content.length
      };
    }
  )
  .prop('file.write',
    t.Function(
      t.Object(
        t.prop('path', t.str),
        t.prop('content', t.str),
        t.propOpt('encoding', t.str)
      ),
      t.Object(
        t.prop('success', t.bool),
        t.prop('bytesWritten', t.num)
      )
    ).options({
      title: 'Write file content',
      description: 'Writes content to a file'
    }),
    async ({ path: filePath, content, encoding = 'utf8' }) => {
      fs.writeFileSync(filePath, content, encoding);
      return {
        success: true,
        bytesWritten: Buffer.from(content, encoding).length
      };
    }
  )
  .prop('file.list',
    t.Function(
      t.Object(
        t.prop('directory', t.str),
        t.propOpt('pattern', t.str)
      ),
      t.Object(
        t.prop('files', t.Array(t.str)),
        t.prop('count', t.num)
      )
    ).options({
      title: 'List directory files',
      description: 'Lists files in a directory, optionally filtered by pattern'
    }),
    async ({ directory, pattern }) => {
      let files = fs.readdirSync(directory);
      
      if (pattern) {
        const regex = new RegExp(pattern);
        files = files.filter(file => regex.test(file));
      }
      
      return {
        files,
        count: files.length
      };
    }
  );

const cli = createCli({
  router,
  version: 'v1.0.0',
  cmd: 'file-cli'
});

cli.run();
```

Usage examples:

```bash
# Read a file
file-cli file.read --str/path=package.json --format=json4

# Write content from STDIN
echo "Hello World" | file-cli file.write --str/path=output.txt --in/content

# List JavaScript files  
file-cli file.list --str/directory=src --str/pattern='\\.js$' --out=/files

# Chain operations: read -> transform -> write
file-cli file.read --str/path=input.json | 
  file-cli transform.data | 
  file-cli file.write --str/path=output.json --in/content --format=json:raw
```

This example demonstrates the full power of JSON Type CLI for building robust, type-safe command-line tools that implement the JSON Rx RPC protocol with rich input/output capabilities.
