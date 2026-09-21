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

    const node =
        value as Record<string, unknown>;

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

        if (node.content !== undefined) {
            return false;
        }

        if (node.contentStatus !== undefined) {
            return false;
        }

        return (node.children ?? []).every(
            child => isTreeNode(child)
        );
    }

    if (node.children !== undefined) {
        return false;
    }

    if (
        node.content !== undefined &&
        typeof node.content !== 'string'
    ) {
        return false;
    }

    if (
        node.contentStatus !== undefined &&
        !isValidContentStatus(
            node.contentStatus
        )
    ) {
        return false;
    }

    return true;
}

function isValidContentStatus(
    value: unknown
): boolean {
    return (
        value === 'available' ||
        value === 'redacted' ||
        value === 'binary' ||
        value === 'too-large'
    );
}