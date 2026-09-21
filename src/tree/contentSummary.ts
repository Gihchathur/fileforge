import { TreeNode } from './types';

export interface ContentSummary {
    available: number;
    redacted: number;
    binary: number;
    tooLarge: number;
}

export function summarizeContent(
    root: TreeNode
): ContentSummary {
    const summary: ContentSummary = {
        available: 0,
        redacted: 0,
        binary: 0,
        tooLarge: 0
    };

    function visit(
        node: TreeNode
    ): void {
        if (node.type === 'file') {
            switch (node.contentStatus) {
                case 'available':
                    summary.available++;
                    break;

                case 'redacted':
                    summary.redacted++;
                    break;

                case 'binary':
                    summary.binary++;
                    break;

                case 'too-large':
                    summary.tooLarge++;
                    break;

                default:
                    if (node.content !== undefined) {
                        summary.available++;
                    }
                    break;
            }
        }

        for (const child of node.children ?? []) {
            visit(child);
        }
    }

    visit(root);

    return summary;
}