import * as assert from 'assert';
import { describe, it } from 'mocha';

import { detectTreeFormat } from '../tree/formatDetector';
import { parseAnyTree } from '../tree/parseAnyTree';
import { parseTree } from '../tree/parser';
import { serializeTree } from '../tree/serializer';

describe('Tree Parser and Serializer', () => {
    it(
        'should detect ASCII tree format',
        () => {
            const input = `
my-project/
├── src/
│   └── app.ts
└── package.json
`;

            assert.strictEqual(
                detectTreeFormat(input),
                'ascii'
            );
        }
    );

    it(
        'should detect Markdown tree format',
        () => {
            const input = `
my-project/
- src/
  - app.ts
- package.json
`;

            assert.strictEqual(
                detectTreeFormat(input),
                'markdown'
            );
        }
    );

    it(
        'should detect JSON tree format',
        () => {
            const input = JSON.stringify({
                name: 'my-project',
                type: 'directory',
                children: []
            });

            assert.strictEqual(
                detectTreeFormat(input),
                'json'
            );
        }
    );

    it(
        'should reject invalid JSON as a JSON format',
        () => {
            const input = `
{
    "name": "my-project",
    "type": "directory",
`;

            assert.notStrictEqual(
                detectTreeFormat(input),
                'json'
            );
        }
    );

    it(
        'should detect unknown format',
        () => {
            const input =
                'This is not a file structure.';

            assert.strictEqual(
                detectTreeFormat(input),
                'unknown'
            );
        }
    );

    it(
        'should parse JSON trees through the unified parser',
        () => {
            const input = JSON.stringify({
                name: 'my-project',
                type: 'directory',
                children: [
                    {
                        name: 'src',
                        type: 'directory',
                        children: [
                            {
                                name: 'app.ts',
                                type: 'file'
                            }
                        ]
                    }
                ]
            });

            const parsed =
                parseAnyTree(input);

            assert.ok(parsed);

            assert.strictEqual(
                parsed.name,
                'my-project'
            );

            assert.strictEqual(
                parsed.children?.[0].name,
                'src'
            );

            assert.strictEqual(
                parsed.children?.[0]
                    .children?.[0].name,
                'app.ts'
            );
        }
    );

    it(
        'should parse a serialized tree correctly',
        () => {
            const input = `
my-project/
├── src/
│   ├── components/
│   │   ├── Footer.tsx
│   │   └── Header.tsx
│   └── App.tsx
├── package.json
└── README.md
`;

            const parsed =
                parseTree(input);

            assert.ok(parsed);

            console.log(
                '--- SERIALIZED TREE ---'
            );

            console.log(input);

            console.log(
                '--- PARSED TREE ---'
            );

            console.log(
                JSON.stringify(
                    parsed,
                    null,
                    2
                )
            );

            assert.strictEqual(
                parsed.name,
                'my-project'
            );

            assert.strictEqual(
                parsed.type,
                'directory'
            );

            assert.strictEqual(
                parsed.children?.length,
                3
            );

            assert.strictEqual(
                parsed.children?.[0].name,
                'src'
            );
        }
    );

    it(
        'should preserve a tree through serialize and parse',
        () => {
            const tree = {
                name: 'my-project',
                type: 'directory' as const,
                children: [
                    {
                        name: 'src',
                        type: 'directory' as const,
                        children: [
                            {
                                name: 'app.ts',
                                type: 'file' as const
                            }
                        ]
                    },
                    {
                        name: 'package.json',
                        type: 'file' as const
                    }
                ]
            };

            const serialized =
                serializeTree(tree);

            const parsed =
                parseTree(serialized);

            assert.deepStrictEqual(
                parsed,
                tree
            );
        }
    );

    it(
        'should parse ASCII trees without directory suffixes',
        () => {
            const input = `
my-project
├── src
│   └── app.ts
└── package.json
`;

            const parsed =
                parseTree(input);

            assert.ok(parsed);

            assert.strictEqual(
                parsed.name,
                'my-project'
            );

            assert.strictEqual(
                parsed.children?.[0].name,
                'src'
            );

            assert.strictEqual(
                parsed.children?.[0].type,
                'directory'
            );

            assert.strictEqual(
                parsed.children?.[0]
                    .children?.[0].name,
                'app.ts'
            );

            assert.strictEqual(
                parsed.children?.[0]
                    .children?.[0].type,
                'file'
            );
        }
    );

    it(
        'should parse Markdown project trees',
        () => {
            const input = `
my-project/
- src/
  - app.ts
  - components/
    - Header.tsx
- package.json
- README.md
`;

            const parsed =
                parseAnyTree(input);

            assert.ok(parsed);

            assert.strictEqual(
                parsed.name,
                'my-project'
            );

            assert.strictEqual(
                parsed.children?.length,
                3
            );

            assert.strictEqual(
                parsed.children?.[0].name,
                'src'
            );

            assert.strictEqual(
                parsed.children?.[0].type,
                'directory'
            );

            assert.strictEqual(
                parsed.children?.[0]
                    .children?.[0].name,
                'app.ts'
            );

            assert.strictEqual(
                parsed.children?.[0]
                    .children?.[0].type,
                'file'
            );

            assert.strictEqual(
                parsed.children?.[0]
                    .children?.[1].name,
                'components'
            );

            assert.strictEqual(
                parsed.children?.[0]
                    .children?.[1].type,
                'directory'
            );
        }
    );

    it(
        'should parse ASCII and Markdown trees through the unified parser',
        () => {
            const asciiInput = `
my-project/
├── src/
│   └── app.ts
└── package.json
`;

            const markdownInput = `
my-project/
- src/
  - app.ts
- package.json
`;

            const asciiTree =
                parseAnyTree(asciiInput);

            const markdownTree =
                parseAnyTree(markdownInput);

            assert.ok(asciiTree);
            assert.ok(markdownTree);

            assert.deepStrictEqual(
                asciiTree,
                markdownTree
            );
        }
    );

    it(
        'should parse a valid JSON project tree',
        () => {
            const input = JSON.stringify({
                name: 'my-project',
                type: 'directory',
                children: [
                    {
                        name: 'src',
                        type: 'directory',
                        children: [
                            {
                                name: 'app.ts',
                                type: 'file'
                            }
                        ]
                    },
                    {
                        name: 'package.json',
                        type: 'file'
                    }
                ]
            });

            const parsed =
                parseAnyTree(input);

            assert.ok(parsed);

            assert.strictEqual(
                parsed.name,
                'my-project'
            );

            assert.strictEqual(
                parsed.children?.length,
                2
            );

            assert.strictEqual(
                parsed.children?.[0].name,
                'src'
            );

            assert.strictEqual(
                parsed.children?.[1].name,
                'package.json'
            );
        }
    );

    it(
        'should reject invalid JSON',
        () => {
            const input =
                '{ invalid json }';

            const parsed =
                parseAnyTree(input);

            assert.strictEqual(
                parsed,
                null
            );
        }
    );

    it(
        'should reject invalid tree structures',
        () => {
            const input = JSON.stringify({
                name: 'my-project',
                type: 'invalid',
                children: []
            });

            const parsed =
                parseAnyTree(input);

            assert.strictEqual(
                parsed,
                null
            );
        }
    );

    it(
        'should reject a file with children',
        () => {
            const input = JSON.stringify({
                name: 'my-project',
                type: 'directory',
                children: [
                    {
                        name: 'app.ts',
                        type: 'file',
                        children: []
                    }
                ]
            });

            const parsed =
                parseAnyTree(input);

            assert.strictEqual(
                parsed,
                null
            );
        }
    );

    it(
        'should parse JSON file content',
        () => {
            const input = JSON.stringify({
                name: 'my-project',
                type: 'directory',
                children: [
                    {
                        name: 'src',
                        type: 'directory',
                        children: [
                            {
                                name: 'app.ts',
                                type: 'file',
                                content:
                                    "console.log('Hello');"
                            }
                        ]
                    }
                ]
            });

            const parsed =
                parseAnyTree(input);

            assert.ok(parsed);

            assert.strictEqual(
                parsed.children?.[0]
                    .children?.[0]
                    .content,
                "console.log('Hello');"
            );
        }
    );

    it(
        'should reject content on directories',
        () => {
            const input = JSON.stringify({
                name: 'my-project',
                type: 'directory',
                content: 'invalid',
                children: []
            });

            const parsed =
                parseAnyTree(input);

            assert.strictEqual(
                parsed,
                null
            );
        }
    );
});