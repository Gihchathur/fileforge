import { TreeNode } from './types';

export function serializeTree(root: TreeNode): string {
    const lines: string[] = [];

    lines.push(`${root.name}/`);

    if (root.children) {
        serializeChildren(root.children, '', lines);
    }

    return lines.join('\n');
}

function serializeChildren(
    nodes: TreeNode[],
    prefix: string,
    lines: string[]
): void {
    const sortedNodes = sortNodes(nodes);

    sortedNodes.forEach((node, index) => {
        const isLast = index === sortedNodes.length - 1;

        const connector = isLast ? '└── ' : '├── ';
        const childPrefix = isLast ? '    ' : '│   ';

        const suffix = node.type === 'directory' ? '/' : '';

        lines.push(
            `${prefix}${connector}${node.name}${suffix}`
        );

        if (node.type === 'directory' && node.children) {
            serializeChildren(
                node.children,
                `${prefix}${childPrefix}`,
                lines
            );
        }
    });
}

function sortNodes(nodes: TreeNode[]): TreeNode[] {
    return [...nodes].sort((a, b) => {
        // Directories first
        if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1;
        }

        return a.name.localeCompare(b.name);
    });
}