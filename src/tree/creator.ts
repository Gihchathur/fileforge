import * as vscode from 'vscode';
import { TreeNode } from './types';

export interface CreationResult {
    created: string[];
    skipped: string[];
}

export async function createTree(
    root: TreeNode
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
        skipped: []
    };

    await createNode(
        root,
        rootUri,
        workspaceFolder.uri,
        result
    );

    return result;
}

async function createNode(
    node: TreeNode,
    uri: vscode.Uri,
    workspaceUri: vscode.Uri,
    result: CreationResult
): Promise<void> {
    if (node.type === 'directory') {
        const exists = await fileExists(uri);

        if (!exists) {
            await vscode.workspace.fs.createDirectory(uri);
            result.created.push(
                relativePath(workspaceUri, uri)
            );
        }

        for (const child of node.children ?? []) {
            const childUri = vscode.Uri.joinPath(
                uri,
                child.name
            );

            await createNode(
                child,
                childUri,
                workspaceUri,
                result
            );
        }

        return;
    }

    if (await fileExists(uri)) {
        result.skipped.push(
            relativePath(workspaceUri, uri)
        );
        return;
    }

    await vscode.workspace.fs.writeFile(
        uri,
        new Uint8Array()
    );

    result.created.push(
        relativePath(workspaceUri, uri)
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
    const workspacePath = workspaceUri.path.endsWith('/')
        ? workspaceUri.path
        : `${workspaceUri.path}/`;

    return uri.path.startsWith(workspacePath)
        ? uri.path.slice(workspacePath.length)
        : uri.path;
}