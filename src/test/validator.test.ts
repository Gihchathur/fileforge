import * as assert from 'assert';
import { describe, it } from 'mocha';
import { validateTree } from '../tree/validator';
import { TreeNode } from '../tree/types';

describe('FileForge Validator', () => {

    it('should accept a valid tree', () => {
        const tree: TreeNode = {
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
                    name: 'README.md',
                    type: 'file'
                }
            ]
        };

        const result = validateTree(tree);

        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.errors.length, 0);
    });

    it('should reject path separators', () => {
        const tree: TreeNode = {
            name: 'project',
            type: 'directory',
            children: [
                {
                    name: '../secret.txt',
                    type: 'file'
                }
            ]
        };

        const result = validateTree(tree);

        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.length > 0);
    });

    it('should reject empty names', () => {
        const tree: TreeNode = {
            name: 'project',
            type: 'directory',
            children: [
                {
                    name: '',
                    type: 'file'
                }
            ]
        };

        const result = validateTree(tree);

        assert.strictEqual(result.valid, false);
    });

    it('should reject backslash paths', () => {
        const tree: TreeNode = {
            name: 'project',
            type: 'directory',
            children: [
                {
                    name: '..\\secret.txt',
                    type: 'file'
                }
            ]
        };

        const result = validateTree(tree);

        assert.strictEqual(result.valid, false);
    });

});