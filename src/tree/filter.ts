import { TreeNode } from './types';

const DEFAULT_IGNORES = [
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    '.next',
    '.nuxt',
    '.vscode',
    'bin',
    'obj'
];

export function filterTree(
    root: TreeNode,
    ignoredNames: string[] = DEFAULT_IGNORES
): TreeNode {
    return {
        ...root,
        children: filterChildren(root.children ?? [], ignoredNames)
    };
}

function filterChildren(
    nodes: TreeNode[],
    ignoredNames: string[]
): TreeNode[] {
    return nodes
        .filter(node => !ignoredNames.includes(node.name))
        .map(node => {
            if (node.type === 'directory') {
                return {
                    ...node,
                    children: filterChildren(
                        node.children ?? [],
                        ignoredNames
                    )
                };
            }

            return node;
        });
}