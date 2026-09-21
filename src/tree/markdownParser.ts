import { TreeNode } from './types';

export function parseMarkdownTree(
    input: string
): TreeNode | null {
    const lines = input
        .split(/\r?\n/)
        .map(line => line.replace(/\s+$/, ''))
        .filter(line => line.trim().length > 0);

    if (lines.length === 0) {
        return null;
    }

    const rootLine = lines[0].trim();

    const root: TreeNode = {
        name: removeDirectorySuffix(rootLine),
        type: 'directory',
        children: []
    };

    const stack: {
        node: TreeNode;
        depth: number;
    }[] = [
        {
            node: root,
            depth: -1
        }
    ];

    for (let i = 1; i < lines.length; i++) {
        const parsed = parseMarkdownLine(lines[i]);

        if (!parsed) {
            continue;
        }

        const {
            depth,
            name,
            type
        } = parsed;

        const node: TreeNode = {
            name,
            type,
            ...(type === 'directory'
                ? { children: [] }
                : {})
        };

        while (
            stack.length > 0 &&
            stack[stack.length - 1].depth >= depth
        ) {
            stack.pop();
        }

        const parent =
            stack[stack.length - 1]?.node;

        if (!parent) {
            continue;
        }

        parent.children ??= [];
        parent.children.push(node);

        if (type === 'directory') {
            stack.push({
                node,
                depth
            });
        }
    }

    return root;
}

function parseMarkdownLine(
    line: string
): {
    depth: number;
    name: string;
    type: 'file' | 'directory';
} | null {
    const match = line.match(
        /^(\s*)[-*+]\s+(.*)$/
    );

    if (!match) {
        return null;
    }

    const whitespace = match[1];

    let name = match[2].trim();

    /*
     * Markdown tree indentation:
     *
     * - src/
     *   - app.ts
     *
     * No indentation = depth 0
     * Two spaces      = depth 1
     * Four spaces     = depth 2
     */
    const depth =
        Math.floor(whitespace.length / 2);

    const hasDirectorySuffix =
        name.endsWith('/');

    if (hasDirectorySuffix) {
        name = name.slice(0, -1);
    }

    const type = hasDirectorySuffix
        ? 'directory'
        : inferNodeType(name);

    return {
        depth,
        name,
        type
    };
}

function inferNodeType(
    name: string
): 'file' | 'directory' {
    const lowerName = name.toLowerCase();

    const knownFiles = new Set([
        'package.json',
        'package-lock.json',
        'yarn.lock',
        'pnpm-lock.yaml',
        'dockerfile',
        'makefile',
        '.gitignore',
        '.dockerignore',
        '.editorconfig',
        'readme',
        'readme.md',
        'license',
        'license.md'
    ]);

    if (knownFiles.has(lowerName)) {
        return 'file';
    }

    const fileExtensions = [
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
        '.mjs',
        '.cjs',
        '.json',
        '.yaml',
        '.yml',
        '.xml',
        '.html',
        '.css',
        '.scss',
        '.less',
        '.md',
        '.txt',
        '.csv',
        '.env',
        '.py',
        '.go',
        '.java',
        '.cs',
        '.cpp',
        '.c',
        '.h',
        '.hpp',
        '.rs',
        '.rb',
        '.php',
        '.sh',
        '.ps1',
        '.sql',
        '.graphql',
        '.proto'
    ];

    if (
        fileExtensions.some(extension =>
            lowerName.endsWith(extension)
        )
    ) {
        return 'file';
    }

    return 'directory';
}

function removeDirectorySuffix(
    name: string
): string {
    return name.endsWith('/')
        ? name.slice(0, -1)
        : name;
}