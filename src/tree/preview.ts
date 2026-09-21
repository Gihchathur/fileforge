import * as vscode from 'vscode';
import { TreeNode } from './types';

export interface PreviewResult {
    create: string[];
    existing: string[];
}

export async function previewTree(
    root: TreeNode
): Promise<PreviewResult> {
    const workspaceFolder =
        vscode.workspace.workspaceFolders?.[0];

    if (!workspaceFolder) {
        throw new Error('No workspace is open.');
    }

    const result: PreviewResult = {
        create: [],
        existing: []
    };

    await inspectNode(
        root,
        vscode.Uri.joinPath(
            workspaceFolder.uri,
            root.name
        ),
        workspaceFolder.uri,
        result
    );

    return result;
}

async function inspectNode(
    node: TreeNode,
    uri: vscode.Uri,
    workspaceUri: vscode.Uri,
    result: PreviewResult
): Promise<void> {
    const relative = relativePath(
        workspaceUri,
        uri
    );

    if (await exists(uri)) {
        result.existing.push(relative);
    } else {
        result.create.push(relative);
    }

    if (node.type === 'directory') {
        for (const child of node.children ?? []) {
            await inspectNode(
                child,
                vscode.Uri.joinPath(uri, child.name),
                workspaceUri,
                result
            );
        }
    }
}

async function exists(
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
        ? uri.path.slice(workspacePath.length)
        : uri.path;
}