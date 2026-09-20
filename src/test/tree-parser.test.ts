import { describe, it } from 'mocha';
import { parseTree } from '../tree/parser';
import { serializeTree } from '../tree/serializer';
import { TreeNode } from '../tree/types';

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