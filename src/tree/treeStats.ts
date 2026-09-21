import { TreeNode } from './types';

export interface TreeStats {
    files: number;
    directories: number;
    total: number;
    maxDepth: number;
}

export function getTreeStats(
    root: TreeNode
): TreeStats {
    const stats: TreeStats = {
        files: 0,
        directories: 0,
        total: 0,
        maxDepth: 0
    };

    visit(
        root,
        0,
        stats
    );

    return stats;
}

function visit(
    node: TreeNode,
    depth: number,
    stats: TreeStats
): void {
    stats.total++;

    stats.maxDepth =
        Math.max(
            stats.maxDepth,
            depth
        );

    if (node.type === 'file') {
        stats.files++;
        return;
    }

    stats.directories++;

    for (
        const child
        of node.children ?? []
    ) {
        visit(
            child,
            depth + 1,
            stats
        );
    }
}