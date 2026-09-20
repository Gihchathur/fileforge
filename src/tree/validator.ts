import { TreeNode } from './types';

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

export function validateTree(
    root: TreeNode
): ValidationResult {
    const errors: string[] = [];

    validateNode(root, '', errors);

    return {
        valid: errors.length === 0,
        errors
    };
}

function validateNode(
    node: TreeNode,
    parentPath: string,
    errors: string[]
): void {
    const currentPath = parentPath
        ? `${parentPath}/${node.name}`
        : node.name;

    validateName(node.name, currentPath, errors);

    if (node.type === 'directory') {
        for (const child of node.children ?? []) {
            validateNode(child, currentPath, errors);
        }
    }
}

function validateName(
    name: string,
    path: string,
    errors: string[]
): void {
    if (!name.trim()) {
        errors.push(`Empty name at "${path}".`);
        return;
    }

    if (name === '.' || name === '..') {
        errors.push(
            `Invalid path component "${name}" at "${path}".`
        );
    }

    if (name.includes('/') || name.includes('\\')) {
        errors.push(
            `Path separator detected in "${path}".`
        );
    }

    if (/^[a-zA-Z]:$/.test(name)) {
        errors.push(
            `Drive path detected in "${path}".`
        );
    }

    if (name.startsWith('~')) {
        errors.push(
            `Home-directory path detected in "${path}".`
        );
    }
}