import * as assert from 'assert';
import { describe, it } from 'mocha';

import { detectTreeFormat } from '../tree/formatDetector';
import { parseAnyTree } from '../tree/parseAnyTree';
import { parseTree } from '../tree/parser';
import { serializeTree } from '../tree/serializer';

describe('Tree Parser', () => {
    it(
        'should detect ASCII tree format',
        () => {
            const input = `
project/
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
project/
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
                name: 'project',
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
        'should reject invalid JSON format',
        () => {
            const input = `
{
    "name": "project",
    "type": "directory"
`;

            assert.strictEqual(
                detectTreeFormat(input),
                'unknown'
            );
        }
    );

    it(
        'should return unknown for unsupported format',
        () => {
            const input = `
This is just some random text.
There is no file structure here.
`;

            assert.strictEqual(
                detectTreeFormat(input),
                'unknown'
            );
        }
    );

    it(
        'should parse JSON using the unified parser',
        () => {
            const input = JSON.stringify({
                name: 'project',
                type: 'directory',
                children: [
                    {
                        name: 'app.ts',
                        type: 'file'
                    }
                ]
            });

            const result =
                parseAnyTree(input);

            assert.ok(result);

            assert.strictEqual(
                result.name,
                'project'
            );

            assert.strictEqual(
                result.type,
                'directory'
            );

            assert.strictEqual(
                result.children?.[0].name,
                'app.ts'
            );

            assert.strictEqual(
                result.children?.[0].type,
                'file'
            );
        }
    );

    it(
        'should parse a serialized tree',
        () => {
            const input = `
project/
├── src/
│   └── app.ts
└── package.json
`;

            const result =
                parseTree(input);

            assert.ok(result);

            assert.strictEqual(
                result.name,
                'project'
            );

            assert.strictEqual(
                result.children?.length,
                2
            );

            assert.strictEqual(
                result.children?.[0].name,
                'src'
            );

            assert.strictEqual(
                result.children?.[0].type,
                'directory'
            );

            assert.strictEqual(
                result.children?.[0]
                    .children?.[0].name,
                'app.ts'
            );
        }
    );

    it(
        'should support ASCII serialize and parse roundtrip',
        () => {
            const tree = {
                name: 'project',
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
        'should infer file and directory types without suffixes',
        () => {
            const input = `
project/
├── src
│   └── app.ts
└── package.json
`;

            const result =
                parseTree(input);

            assert.ok(result);

            assert.strictEqual(
                result.children?.[0].name,
                'src'
            );

            assert.strictEqual(
                result.children?.[0].type,
                'directory'
            );

            assert.strictEqual(
                result.children?.[1].name,
                'package.json'
            );

            assert.strictEqual(
                result.children?.[1].type,
                'file'
            );
        }
    );

    it(
        'should parse a Markdown project tree',
        () => {
            const input = `
project/
- src/
  - app.ts
  - components/
    - Button.tsx
- package.json
`;

            const result =
                parseAnyTree(input);

            assert.ok(result);

            assert.strictEqual(
                result.name,
                'project'
            );

            assert.strictEqual(
                result.children?.length,
                2
            );

            assert.strictEqual(
                result.children?.[0].name,
                'src'
            );

            assert.strictEqual(
                result.children?.[0].type,
                'directory'
            );

            assert.strictEqual(
                result.children?.[0]
                    .children?.[0].name,
                'app.ts'
            );

            assert.strictEqual(
                result.children?.[0]
                    .children?.[1].name,
                'components'
            );

            assert.strictEqual(
                result.children?.[0]
                    .children?.[1]
                    .children?.[0].name,
                'Button.tsx'
            );
        }
    );

    it(
        'should parse equivalent ASCII and Markdown trees',
        () => {
            const asciiInput = `
project/
├── src/
│   ├── app.ts
│   └── components/
│       └── Button.tsx
└── package.json
`;

            const markdownInput = `
project/
- src/
  - app.ts
  - components/
    - Button.tsx
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
                name: 'project',
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

            const result =
                parseAnyTree(input);

            assert.ok(result);

            assert.strictEqual(
                result.name,
                'project'
            );

            assert.strictEqual(
                result.children?.[0].name,
                'src'
            );

            assert.strictEqual(
                result.children?.[0]
                    .children?.[0].name,
                'app.ts'
            );

            assert.strictEqual(
                result.children?.[1].name,
                'package.json'
            );
        }
    );

    it(
        'should reject invalid JSON',
        () => {
            const input =
                '{"name":"project","type":';

            const result =
                parseAnyTree(input);

            assert.strictEqual(
                result,
                null
            );
        }
    );

    it(
        'should reject invalid JSON tree structure',
        () => {
            const input = JSON.stringify({
                name: 'project',
                type: 'invalid',
                children: []
            });

            const result =
                parseAnyTree(input);

            assert.strictEqual(
                result,
                null
            );
        }
    );

    it(
        'should reject files with children',
        () => {
            const input = JSON.stringify({
                name: 'project',
                type: 'directory',
                children: [
                    {
                        name: 'app.ts',
                        type: 'file',
                        children: []
                    }
                ]
            });

            const result =
                parseAnyTree(input);

            assert.strictEqual(
                result,
                null
            );
        }
    );

    it(
        'should parse JSON file content',
        () => {
            const input = JSON.stringify({
                name: 'project',
                type: 'directory',
                children: [
                    {
                        name: 'app.ts',
                        type: 'file',
                        content:
                            "console.log('Hello');"
                    }
                ]
            });

            const result =
                parseAnyTree(input);

            assert.ok(result);

            assert.strictEqual(
                result.children?.[0].content,
                "console.log('Hello');"
            );
        }
    );

    it(
        'should reject directories with content',
        () => {
            const input = JSON.stringify({
                name: 'project',
                type: 'directory',
                content: 'invalid',
                children: []
            });

            const result =
                parseAnyTree(input);

            assert.strictEqual(
                result,
                null
            );
        }
    );

    it(
        'should accept valid content status values',
        () => {
            const statuses = [
                'available',
                'redacted',
                'binary',
                'too-large'
            ];

            for (const status of statuses) {
                const input = JSON.stringify({
                    name: 'project',
                    type: 'directory',
                    children: [
                        {
                            name: 'app.ts',
                            type: 'file',
                            contentStatus: status
                        }
                    ]
                });

                const result =
                    parseAnyTree(input);

                assert.ok(result);

                assert.strictEqual(
                    result.children?.[0]
                        .contentStatus,
                    status
                );
            }
        }
    );

    it(
        'should reject invalid content status values',
        () => {
            const input = JSON.stringify({
                name: 'project',
                type: 'directory',
                children: [
                    {
                        name: 'app.ts',
                        type: 'file',
                        contentStatus: 'unknown'
                    }
                ]
            });

            const result =
                parseAnyTree(input);

            assert.strictEqual(
                result,
                null
            );
        }
    );

    it(
        'should reject content status on directories',
        () => {
            const input = JSON.stringify({
                name: 'project',
                type: 'directory',
                contentStatus: 'available',
                children: []
            });

            const result =
                parseAnyTree(input);

            assert.strictEqual(
                result,
                null
            );
        }
    );
});