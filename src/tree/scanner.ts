import * as vscode from 'vscode';
import { TreeNode } from './types';

export async function scanWorkspace(): Promise<TreeNode | null> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

    if (!workspaceFolder) {
        return null;
    }

    const rootUri = workspaceFolder.uri;

    const rootName = workspaceFolder.name;

    const children = await scanDirectory(rootUri);

    return {
        name: rootName,
        type: 'directory',
        children
    };
}

async function scanDirectory(
    directoryUri: vscode.Uri
): Promise<TreeNode[]> {
    const entries = await vscode.workspace.fs.readDirectory(directoryUri);

    const nodes: TreeNode[] = [];

    for (const [name, type] of entries) {
        const entryUri = vscode.Uri.joinPath(directoryUri, name);

        if (type === vscode.FileType.Directory) {
            const children = await scanDirectory(entryUri);

            nodes.push({
                name,
                type: 'directory',
                children
            });
        } else if (type === vscode.FileType.File) {
            nodes.push({
                name,
                type: 'file'
            });
        }
    }

    return nodes;
}