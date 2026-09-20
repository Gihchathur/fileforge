import * as vscode from 'vscode';
import { TreeNode } from '../tree/types';
import { PreviewResult } from '../tree/preview';

export function showImportPreview(
    context: vscode.ExtensionContext,
    root: TreeNode,
    preview: PreviewResult
): Promise<boolean> {
    return new Promise(resolve => {
        const panel = vscode.window.createWebviewPanel(
            'fileforgeImportPreview',
            'FileForge — Import Preview',
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

        panel.webview.html = getHtml(root, preview);

        const disposable =
            panel.webview.onDidReceiveMessage(
                message => {
                    if (message.command === 'create') {
                        panel.dispose();
                        resolve(true);
                    }

                    if (message.command === 'cancel') {
                        panel.dispose();
                        resolve(false);
                    }
                }
            );

        panel.onDidDispose(() => {
            disposable.dispose();
            resolve(false);
        });
    });
}

function getHtml(
    root: TreeNode,
    preview: PreviewResult
): string {
    const treeHtml = renderTree(root, preview);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">

<style>
body {
    font-family: var(--vscode-font-family);
    color: var(--vscode-foreground);
    background: var(--vscode-editor-background);
    padding: 20px;
}

h1 {
    font-size: 20px;
}

.summary {
    margin: 16px 0;
    color: var(--vscode-descriptionForeground);
}

.tree {
    font-family: var(--vscode-editor-font-family);
    line-height: 1.7;
}

.create {
    color: var(--vscode-testing-iconPassed);
}

.existing {
    color: var(--vscode-descriptionForeground);
}

.actions {
    margin-top: 25px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

button {
    padding: 7px 16px;
    border: none;
    cursor: pointer;
}

.primary {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
}

.secondary {
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground);
}
    .tree {
    font-family: var(--vscode-editor-font-family);
    line-height: 1.8;
    margin-top: 20px;
}

.tree-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.status {
    font-size: 11px;
    padding: 1px 6px;
    border-radius: 4px;
    margin-left: 6px;
}

.create .status {
    color: var(--vscode-testing-iconPassed);
}

.existing .status {
    color: var(--vscode-descriptionForeground);
}
</style>
</head>

<body>

<h1>FileForge — Import Preview</h1>

<div class="summary">
    ${preview.create.length} item(s) will be created ·
    ${preview.existing.length} already exist
</div>

<div class="tree">
    ${treeHtml}
</div>

<div class="actions">
    <button class="secondary" onclick="cancel()">
        Cancel
    </button>

    <button class="primary" onclick="create()">
        Create
    </button>
</div>

<script>
const vscode = acquireVsCodeApi();

function create() {
    vscode.postMessage({
        command: 'create'
    });
}

function cancel() {
    vscode.postMessage({
        command: 'cancel'
    });
}
</script>

</body>
</html>
`;
}

function renderTree(
    node: TreeNode,
    preview: PreviewResult,
    depth = 0,
    parentPath = ''
): string {
    const currentPath = parentPath
        ? `${parentPath}/${node.name}`
        : node.name;

    const indent = '&nbsp;'.repeat(depth * 4);

    const icon =
        node.type === 'directory'
            ? '📁'
            : '📄';

    const isCreate =
        preview.create.includes(currentPath);

    const statusClass =
        isCreate
            ? 'create'
            : 'existing';

    const status =
        isCreate
            ? 'CREATE'
            : 'EXISTS';

    let html = `
        <div class="tree-row ${statusClass}">
            ${indent}${icon}
            <span>${escapeHtml(node.name)}</span>
            <span class="status">${status}</span>
        </div>
    `;

    for (const child of node.children ?? []) {
        html += renderTree(
            child,
            preview,
            depth + 1,
            currentPath
        );
    }

    return html;
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}