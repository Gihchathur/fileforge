import * as vscode from 'vscode';
import { Buffer } from 'buffer';

import { isSensitiveFile } from './contentFilter';
import { isBinaryContent } from './binaryDetector';
import { TreeNode } from './types';

export async function serializeTreeWithContent(
    root: TreeNode,
    rootUri: vscode.Uri
): Promise<string> {
    const tree =
        await addFileContents(
            root,
            rootUri
        );

    return JSON.stringify(
        tree,
        null,
        2
    );
}

async function addFileContents(
    node: TreeNode,
    uri: vscode.Uri
): Promise<TreeNode> {
    if (node.type === 'file') {
        if (isSensitiveFile(node.name)) {
            return {
                ...node,
                content: '[CONTENT REDACTED]'
            };
        }

        const configuration =
            vscode.workspace.getConfiguration(
                'fileforge'
            );

        const maxFileSize =
            configuration.get<number>(
                'maxContentFileSize',
                1048576
            );

        const fileStat =
            await vscode.workspace.fs.stat(
                uri
            );

        if (fileStat.size > maxFileSize) {
            return {
                ...node,
                content: '[CONTENT NOT EXPORTED: FILE TOO LARGE]'
            };
        }

        const data =
            await vscode.workspace.fs.readFile(
                uri
            );

        if (isBinaryContent(data)) {
            return {
                ...node,
                content: '[BINARY CONTENT NOT EXPORTED]'
            };
        }

        return {
            ...node,
            content: Buffer.from(
                data
            ).toString('utf8')
        };
    }

    const children: TreeNode[] = [];

    for (const child of node.children ?? []) {
        const childUri =
            vscode.Uri.joinPath(
                uri,
                child.name
            );

        children.push(
            await addFileContents(
                child,
                childUri
            )
        );
    }

    return {
        ...node,
        children
    };
}