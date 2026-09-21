import { detectTreeFormat } from './formatDetector';
import { parseJsonTree } from './jsonParser';
import { parseMarkdownTree } from './markdownParser';
import { parseTree } from './parser';
import { TreeNode } from './types';

export function parseAnyTree(
    input: string
): TreeNode | null {
    const format = detectTreeFormat(input);

    switch (format) {
        case 'ascii':
            return parseTree(input);

        case 'markdown':
            return parseMarkdownTree(input);

        case 'json':
            return parseJsonTree(input);

        default:
            return null;
    }
}