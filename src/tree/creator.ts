import * as vscode from 'vscode';
import { Buffer } from 'buffer';
import { ConflictMode } from './conflict';
import { TreeNode } from './types';

export interface CreationResult {
    created: string[];
    skipped: string[];
    filesWithContent: string[];
    filesWithoutContent: string[];
}
export async function createTree(
    root: TreeNode,
    conflictMode: ConflictMode = 'skip'
): Promise<CreationResult> {
    const workspaceFolder =
        vscode.workspace.workspaceFolders?.[0];

    if (!workspaceFolder) {
        throw new Error('No workspace is open.');
    }

    const rootUri = vscode.Uri.joinPath(
        workspaceFolder.uri,
        root.name
    );

    const result: CreationResult = {
        created: [],
        skipped: [],
        filesWithContent: [],
        filesWithoutContent: []
    };
    await createNode(
        root,
        rootUri,
        workspaceFolder.uri,
        result,
        conflictMode
    );

    return result;
}

async function createNode(
    node: TreeNode,
    uri: vscode.Uri,
    workspaceUri: vscode.Uri,
    result: CreationResult,
    conflictMode: ConflictMode
): Promise<void> {
    if (node.type === 'directory') {
        const exists = await fileExists(uri);

        if (!exists) {
            await vscode.workspace.fs.createDirectory(uri);

            result.created.push(
                relativePath(
                    workspaceUri,
                    uri
                )
            );
        }

        for (const child of node.children ?? []) {
            const childUri =
                vscode.Uri.joinPath(
                    uri,
                    child.name
                );

            await createNode(
                child,
                childUri,
                workspaceUri,
                result,
                conflictMode
            );
        }

        return;
    }

    if (await fileExists(uri)) {
        if (conflictMode === 'skip') {
            result.skipped.push(
                relativePath(
                    workspaceUri,
                    uri
                )
            );

            return;
        }

        if (conflictMode === 'overwrite') {
            result.skipped.push(
                relativePath(
                    workspaceUri,
                    uri
                )
            );

            return;
        }
    }

    const content =
        node.contentStatus === 'available'
            ? node.content ?? ''
            : node.contentStatus === undefined
                ? node.content ?? ''
                : '';

    const encodedContent =
        Buffer.from(content, 'utf8');

    await vscode.workspace.fs.writeFile(
        uri,
        encodedContent
    );

    if (node.contentStatus === 'available') {
        result.filesWithContent.push(
            relativePath(
                workspaceUri,
                uri
            )
        );
    } else {
        result.filesWithoutContent.push(
            relativePath(
                workspaceUri,
                uri
            )
        );
    }

    result.created.push(
        relativePath(
            workspaceUri,
            uri
        )
    );
}

async function fileExists(
    uri: vscode.Uri
): Promise<boolean> {
    try {
        await vscode.workspace.fs.stat(uri);
        return true;
    } catch {
        return false;
    }
}

function relativePath(
    workspaceUri: vscode.Uri,
    uri: vscode.Uri
): string {
    const workspacePath =
        workspaceUri.path.endsWith('/')
            ? workspaceUri.path
            : `${workspaceUri.path}/`;

    return uri.path.startsWith(workspacePath)
        ? uri.path.slice(
            workspacePath.length
        )
        : uri.path;
}