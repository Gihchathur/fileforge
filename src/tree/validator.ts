import { TreeNode } from './types';

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

export function validateTree(
    root: TreeNode
): ValidationResult {
    const errors: string[] = [];

    if (root.type !== 'directory') {
        errors.push(
            'Root node must be a directory.'
        );
    }

    validateNode(
        root,
        '',
        errors,
        true
    );

    return {
        valid: errors.length === 0,
        errors
    };
}

function validateNode(
    node: TreeNode,
    parentPath: string,
    errors: string[],
    isRoot = false
): void {
    const currentPath = parentPath
        ? `${parentPath}/${node.name}`
        : node.name;

    validateName(
        node.name,
        currentPath,
        errors
    );

    if (
        isRoot &&
        node.type !== 'directory'
    ) {
        errors.push(
            `Root node "${node.name}" must be a directory.`
        );
    }

    if (node.type === 'directory') {
        const children =
            node.children ?? [];

        const names = new Set<string>();

        for (const child of children) {
            if (names.has(child.name)) {
                errors.push(
                    `Duplicate entry "${child.name}" at "${currentPath}".`
                );
            }

            names.add(child.name);

            validateNode(
                child,
                currentPath,
                errors
            );
        }
    }
}

function validateName(
    name: string,
    path: string,
    errors: string[]
): void {
    if (!name.trim()) {
        errors.push(
            `Empty name at "${path}".`
        );
        return;
    }

    if (
        name === '.' ||
        name === '..'
    ) {
        errors.push(
            `Invalid path component "${name}" at "${path}".`
        );
    }

    if (
        name.includes('/') ||
        name.includes('\\')
    ) {
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

    if (
        name.includes('\0')
    ) {
        errors.push(
            `Null character detected in "${path}".`
        );
    }
}