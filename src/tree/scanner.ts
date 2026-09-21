import * as vscode from 'vscode';
import { TreeNode } from './types';

const DEFAULT_IGNORES = [
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    '.next',
    '.nuxt',
    '.vscode',
    'bin',
    'obj'
];

export async function scanWorkspace(): Promise<TreeNode | null> {
    const workspaceFolder =
        vscode.workspace.workspaceFolders?.[0];

    if (!workspaceFolder) {
        return null;
    }

    const configuration =
        vscode.workspace.getConfiguration('fileforge');

    const ignoredNames =
        configuration.get<string[]>(
            'ignoreDirectories',
            DEFAULT_IGNORES
        );

    const rootUri = workspaceFolder.uri;
    const rootName = workspaceFolder.name;

    const children = await scanDirectory(
        rootUri,
        ignoredNames
    );

    return {
        name: rootName,
        type: 'directory',
        children
    };
}

async function scanDirectory(
    directoryUri: vscode.Uri,
    ignoredNames: string[]
): Promise<TreeNode[]> {
    const entries =
        await vscode.workspace.fs.readDirectory(
            directoryUri
        );

    const nodes: TreeNode[] = [];

    for (const [name, type] of entries) {
        if (ignoredNames.includes(name)) {
            continue;
        }

        const entryUri =
            vscode.Uri.joinPath(
                directoryUri,
                name
            );

        if (type === vscode.FileType.Directory) {
            const children = await scanDirectory(
                entryUri,
                ignoredNames
            );

            nodes.push({
                name,
                type: 'directory',
                children
            });
        } else if (
            type === vscode.FileType.File
        ) {
            nodes.push({
                name,
                type: 'file'
            });
        }
    }

    return nodes;
}