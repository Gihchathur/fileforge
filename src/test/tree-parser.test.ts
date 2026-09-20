import * as assert from 'assert';
import { describe, it } from 'mocha';

import { parseTree } from '../tree/parser';
import { serializeTree } from '../tree/serializer';
import { TreeNode } from '../tree/types';

describe('Tree Parser and Serializer', () => {

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

});