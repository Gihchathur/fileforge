import { TreeNode } from './types';

export function parseJsonTree(
    input: string
): TreeNode | null {
    let parsed: unknown;

    try {
        parsed = JSON.parse(input);
    } catch {
        return null;
    }

    if (!isTreeNode(parsed)) {
        return null;
    }

    return parsed;
}

function isTreeNode(
    value: unknown
): value is TreeNode {
    if (
        typeof value !== 'object' ||
        value === null
    ) {
        return false;
    }

    const node = value as Record<string, unknown>;

    if (
        typeof node.name !== 'string' ||
        typeof node.type !== 'string'
    ) {
        return false;
    }

    if (
        node.type !== 'file' &&
        node.type !== 'directory'
    ) {
        return false;
    }

    if (node.type === 'directory') {
        if (
            node.children !== undefined &&
            !Array.isArray(node.children)
        ) {
            return false;
        }

        return (node.children ?? []).every(
            child => isTreeNode(child)
        );
    }

    return node.children === undefined;
}