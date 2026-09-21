import * as assert from 'assert';
import { describe, it } from 'mocha';

import { parseTree } from '../tree/parser';
import { serializeTree } from '../tree/serializer';
import { TreeNode } from '../tree/types';
import { parseMarkdownTree } from '../tree/markdownParser';
import { parseAnyTree } from '../tree/parseAnyTree';
import { parseJsonTree } from '../tree/jsonParser';
import { detectTreeFormat } from '../tree/formatDetector';

describe('Tree Parser and Serializer', () => {

    it('should detect ASCII tree format', () => {
        const input = `my-project/
    ├── src/
    │   └── app.ts
    └── README.md`;

        assert.strictEqual(
            detectTreeFormat(input),
            'ascii'
        );
    });

    it('should detect Markdown tree format', () => {
        const input = `my-project/
    - src/
    - app.ts
    - README.md`;

        assert.strictEqual(
            detectTreeFormat(input),
            'markdown'
        );
    });

    it('should detect JSON tree format', () => {
        const input = JSON.stringify({
            name: 'my-project',
            type: 'directory',
            children: [
                {
                    name: 'src',
                    type: 'directory',
                    children: []
                }
            ]
        });

        assert.strictEqual(
            detectTreeFormat(input),
            'json'
        );
    });

    it('should reject invalid JSON as a JSON format', () => {
        const input = `{
            "name": "my-project",
            "type": "directory",
        }`;

        assert.notStrictEqual(
            detectTreeFormat(input),
            'json'
        );
    });

    it('should detect unknown format', () => {
        const input = `This is just some
    random text that is not
    a project tree.`;

        assert.strictEqual(
            detectTreeFormat(input),
            'unknown'
        );
    });

    it('should parse JSON trees through the unified parser', () => {
        const jsonInput = JSON.stringify({
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
                    name: 'README.md',
                    type: 'file'
                }
            ]
        });

        const tree = parseAnyTree(jsonInput);

        assert.ok(tree);

        assert.strictEqual(
            tree.name,
            'my-project'
        );

        assert.strictEqual(
            tree.type,
            'directory'
        );

        const src = tree.children?.find(
            node => node.name === 'src'
        );

        assert.ok(src);

        assert.strictEqual(
            src.type,
            'directory'
        );

        const app = src.children?.find(
            node => node.name === 'app.ts'
        );

        assert.ok(app);

        assert.strictEqual(
            app.type,
            'file'
        );

        const readme = tree.children?.find(
            node => node.name === 'README.md'
        );

        assert.ok(readme);

        assert.strictEqual(
            readme.type,
            'file'
        );
    });

    it('should parse a serialized tree correctly', () => {
        const originalTree: TreeNode = {
            name: 'my-project',
            type: 'directory',
            children: [
                {
                    name: 'src',
                    type: 'directory',
                    children: [
                        {
                            name: 'components',
                            type: 'directory',
                            children: [
                                {
                                    name: 'Header.tsx',
                                    type: 'file'
                                },
                                {
                                    name: 'Footer.tsx',
                                    type: 'file'
                                }
                            ]
                        },
                        {
                            name: 'App.tsx',
                            type: 'file'
                        }
                    ]
                },
                {
                    name: 'package.json',
                    type: 'file'
                },
                {
                    name: 'README.md',
                    type: 'file'
                }
            ]
        };

        const serialized = serializeTree(originalTree);

        console.log('--- SERIALIZED TREE ---');
        console.log(serialized);

        const parsed = parseTree(serialized);

        console.log('\n--- PARSED TREE ---');
        console.log(JSON.stringify(parsed, null, 2));

        assert.ok(parsed);

        const reserialized = serializeTree(parsed);

        assert.strictEqual(
            reserialized,
            serialized
        );
    });

    it('should preserve a tree through serialize and parse', () => {
        const original: TreeNode = {
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
                        },
                        {
                            name: 'utils.ts',
                            type: 'file'
                        }
                    ]
                },
                {
                    name: 'tests',
                    type: 'directory',
                    children: [
                        {
                            name: 'app.test.ts',
                            type: 'file'
                        }
                    ]
                },
                {
                    name: 'package.json',
                    type: 'file'
                },
                {
                    name: 'README.md',
                    type: 'file'
                }
            ]
        };

        const serialized = serializeTree(original);
        const parsed = parseTree(serialized);

        assert.deepStrictEqual(
            parsed,
            original
        );
    });

    it('should parse ASCII trees without directory suffixes', () => {
        const input = `my-project
├── src
│   ├── app.ts
│   └── utils.ts
├── components
│   ├── Header.tsx
│   └── Footer.tsx
└── package.json`;

        const parsed = parseTree(input);

        assert.ok(parsed);

        assert.strictEqual(
            parsed.name,
            'my-project'
        );

        assert.strictEqual(
            parsed.children?.find(
                node => node.name === 'src'
            )?.type,
            'directory'
        );

        assert.strictEqual(
            parsed.children?.find(
                node => node.name === 'package.json'
            )?.type,
            'file'
        );
    });

    it('should parse Markdown project trees', () => {
        const input = `my-project/
- src/
  - components/
    - Header.tsx
    - Footer.tsx
  - App.tsx
- package.json
- README.md`;

        const parsed = parseMarkdownTree(input);

        assert.ok(parsed);

        assert.strictEqual(
            parsed.name,
            'my-project'
        );

        const src = parsed.children?.find(
            node => node.name === 'src'
        );

        assert.ok(src);

        assert.strictEqual(
            src.type,
            'directory'
        );

        const components = src.children?.find(
            node => node.name === 'components'
        );

        assert.ok(components);

        assert.strictEqual(
            components.type,
            'directory'
        );

        const header = components.children?.find(
            node => node.name === 'Header.tsx'
        );

        assert.ok(header);

        assert.strictEqual(
            header.type,
            'file'
        );

        const app = src.children?.find(
            node => node.name === 'App.tsx'
        );

        assert.ok(app);

        assert.strictEqual(
            app.type,
            'file'
        );

        const packageJson =
            parsed.children?.find(
                node => node.name === 'package.json'
            );

        assert.ok(packageJson);

        assert.strictEqual(
            packageJson.type,
            'file'
        );

        const readme =
            parsed.children?.find(
                node => node.name === 'README.md'
            );

        assert.ok(readme);

        assert.strictEqual(
            readme.type,
            'file'
        );
    });

    it('should parse ASCII and Markdown trees through the unified parser', () => {
        const asciiInput = `my-project/
├── src/
│   └── app.ts
└── README.md`;

        const markdownInput = `my-project/
- src/
  - app.ts
- README.md`;

        const asciiTree = parseAnyTree(asciiInput);
        const markdownTree = parseAnyTree(markdownInput);

        assert.ok(asciiTree);
        assert.ok(markdownTree);

        assert.strictEqual(
            asciiTree.name,
            'my-project'
        );

        assert.strictEqual(
            markdownTree.name,
            'my-project'
        );

        const asciiSrc =
            asciiTree.children?.find(
                node => node.name === 'src'
            );

        const markdownSrc =
            markdownTree.children?.find(
                node => node.name === 'src'
            );

        assert.ok(asciiSrc);
        assert.ok(markdownSrc);

        assert.strictEqual(
            asciiSrc.type,
            'directory'
        );

        assert.strictEqual(
            markdownSrc.type,
            'directory'
        );

        const asciiApp =
            asciiSrc.children?.find(
                node => node.name === 'app.ts'
            );

        const markdownApp =
            markdownSrc.children?.find(
                node => node.name === 'app.ts'
            );

        assert.ok(asciiApp);
        assert.ok(markdownApp);

        assert.strictEqual(
            asciiApp.type,
            'file'
        );

        assert.strictEqual(
            markdownApp.type,
            'file'
        );

        const asciiReadme =
            asciiTree.children?.find(
                node => node.name === 'README.md'
            );

        const markdownReadme =
            markdownTree.children?.find(
                node => node.name === 'README.md'
            );

        assert.ok(asciiReadme);
        assert.ok(markdownReadme);

        assert.strictEqual(
            asciiReadme.type,
            'file'
        );

        assert.strictEqual(
            markdownReadme.type,
            'file'
        );
    });

    it('should parse a valid JSON project tree', () => {
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
                    name: 'README.md',
                    type: 'file'
                }
            ]
        });

        const tree = parseJsonTree(input);

        assert.ok(tree);

        assert.equal(
            tree.name,
            'my-project'
        );

        assert.equal(
            tree.type,
            'directory'
        );

        assert.equal(
            tree.children?.length,
            2
        );

        assert.equal(
            tree.children?.[0].name,
            'src'
        );

        assert.equal(
            tree.children?.[0].children?.[0].name,
            'app.ts'
        );

        assert.equal(
            tree.children?.[1].name,
            'README.md'
        );
    });

    it('should reject invalid JSON', () => {
        const input = `{
            "name": "my-project",
            "type": "directory",
        }`;

        const tree = parseJsonTree(input);

        assert.equal(
            tree,
            null
        );
    });

    it('should reject invalid tree structures', () => {
        const input = JSON.stringify({
            name: 'my-project',
            type: 'invalid',
            children: []
        });

        const tree = parseJsonTree(input);

        assert.equal(
            tree,
            null
        );
    });

    it('should reject a file with children', () => {
        const input = JSON.stringify({
            name: 'app.ts',
            type: 'file',
            children: [
                {
                    name: 'nested.ts',
                    type: 'file'
                }
            ]
        });

        const tree = parseJsonTree(input);

        assert.equal(
            tree,
            null
        );
    });

});