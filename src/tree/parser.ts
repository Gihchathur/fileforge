import { TreeNode } from './types';

export function parseTree(input: string): TreeNode | null {
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
        const line = lines[i];

        const parsed = parseLine(line);

        if (!parsed) {
            continue;
        }

        const { depth, name, type } = parsed;

        const node: TreeNode = {
            name,
            type,
            ...(type === 'directory' ? { children: [] } : {})
        };

        while (
            stack.length > 0 &&
            stack[stack.length - 1].depth >= depth
        ) {
            stack.pop();
        }

        const parent = stack[stack.length - 1]?.node;

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

function parseLine(
    line: string
): {
    depth: number;
    name: string;
    type: 'file' | 'directory';
} | null {
    const match = line.match(
        /^((?:│   |    )*)(?:├── |└── )(.*)$/
    );

    if (!match) {
        return null;
    }

    const prefix = match[1];
    let name = match[2];

    const depth = prefix.length / 4;

    const isDirectory = name.endsWith('/');

    if (isDirectory) {
        name = name.slice(0, -1);
    }

    return {
        depth,
        name,
        type: isDirectory ? 'directory' : 'file'
    };
}

function removeDirectorySuffix(name: string): string {
    return name.endsWith('/')
        ? name.slice(0, -1)
        : name;
}