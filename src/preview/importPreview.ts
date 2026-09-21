import * as vscode from 'vscode';
import { TreeNode } from '../tree/types';
import { PreviewResult } from '../tree/preview';

export function showImportPreview(
    context: vscode.ExtensionContext,
    root: TreeNode,
    preview: PreviewResult,
    conflictMode: 'skip' | 'overwrite'
): Promise<boolean> {
    return new Promise(resolve => {
        let completed = false;

        const panel = vscode.window.createWebviewPanel(
            'fileforgeImportPreview',
            'FileForge — Import Preview',
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

        panel.webview.html = getHtml(
            root,
            preview,
            conflictMode
        );

        const disposable =
            panel.webview.onDidReceiveMessage(
                message => {
                    if (message.command === 'create') {
                        completed = true;

                        disposable.dispose();
                        panel.dispose();

                        resolve(true);
                        return;
                    }

                    if (message.command === 'cancel') {
                        completed = true;

                        disposable.dispose();
                        panel.dispose();

                        resolve(false);
                        return;
                    }
                }
            );

        panel.onDidDispose(() => {
            disposable.dispose();

            if (!completed) {
                resolve(false);
            }
        });
    });
}

function getHtml(
    root: TreeNode,
    preview: PreviewResult,
    conflictMode: 'skip' | 'overwrite'
): string {
    const treeHtml = renderTree(
        root,
        preview,
        conflictMode
    );

    const conflictDescription =
        conflictMode === 'skip'
            ? 'Existing files will be kept unchanged.'
            : 'Existing files will be kept unchanged.';

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
    display: flex;
    gap: 12px;
    margin: 20px 0;
}

.summary-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border: 1px solid var(--vscode-panel-border);
    border-radius: 6px;
}

.summary-count {
    font-size: 18px;
    font-weight: 600;
}

.create-summary {
    color: var(--vscode-testing-iconPassed);
}

.existing-summary {
    color: var(--vscode-descriptionForeground);
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

.overwrite .status {
    color: var(--vscode-descriptionForeground);
}

.content-warning .status {
    color: var(--vscode-editorWarning-foreground);
}

.conflict-mode {
    padding: 12px 14px;
    margin: 15px 0;
    border: 1px solid var(--vscode-panel-border);
    border-radius: 6px;
}

.conflict-description {
    margin-top: 5px;
    color: var(--vscode-descriptionForeground);
    font-size: 13px;
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
</style>
</head>

<body>

<h1>FileForge — Import Preview</h1>

<div class="conflict-mode">
    <strong>Conflict handling:</strong>
    ${conflictMode === 'skip'
        ? 'Skip existing files'
        : 'Keep existing files'}
    <div class="conflict-description">
        ${conflictDescription}
    </div>
</div>

<div class="summary">
    <div class="summary-item create-summary">
        <span class="summary-count">
            ${preview.create.length}
        </span>
        <span>
            item(s) will be created
        </span>
    </div>

    <div class="summary-item create-summary">
        <span class="summary-count">
            ${countFilesWithContent(root)}
        </span>
        <span>
            file(s) contain imported content
        </span>
    </div>

    <div class="summary-item existing-summary">
        <span class="summary-count">
            ${countFilesWithStatus(
                root,
                'redacted'
            )}
        </span>
        <span>
            file(s) have redacted content
        </span>
    </div>

    <div class="summary-item existing-summary">
        <span class="summary-count">
            ${countFilesWithStatus(
                root,
                'binary'
            )}
        </span>
        <span>
            binary file(s)
        </span>
    </div>

    <div class="summary-item existing-summary">
        <span class="summary-count">
            ${countFilesWithStatus(
                root,
                'too-large'
            )}
        </span>
        <span>
            file(s) exceed the content limit
        </span>
    </div>

    <div class="summary-item existing-summary">
        <span class="summary-count">
            ${preview.existing.length}
        </span>
        <span>
            item(s) will be kept
        </span>
    </div>
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
    conflictMode: 'skip' | 'overwrite',
    depth = 0,
    parentPath = ''
): string {
    const currentPath = parentPath
        ? `${parentPath}/${node.name}`
        : node.name;

    const indent =
        '&nbsp;'.repeat(depth * 4);

    const icon =
        node.type === 'directory'
            ? '📁'
            : '📄';

    const isExisting =
        preview.existing.includes(
            currentPath
        );

    const isCreate =
        preview.create.includes(
            currentPath
        );

    const status =
        getNodeStatus(
            node,
            isExisting,
            conflictMode
        );

    const statusClass =
        isExisting
            ? 'existing'
            : status === 'CONTENT REDACTED' ||
              status === 'BINARY CONTENT' ||
              status === 'CONTENT TOO LARGE'
                ? 'content-warning'
                : isCreate
                    ? 'create'
                    : 'existing';

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
            conflictMode,
            depth + 1,
            currentPath
        );
    }

    return html;
}

function getNodeStatus(
    node: TreeNode,
    existing: boolean,
    conflictMode: 'skip' | 'overwrite'
): string {
    if (existing) {
        return 'KEEP';
    }

    if (
        node.type === 'file' &&
        node.contentStatus === 'redacted'
    ) {
        return 'CONTENT REDACTED';
    }

    if (
        node.type === 'file' &&
        node.contentStatus === 'binary'
    ) {
        return 'BINARY CONTENT';
    }

    if (
        node.type === 'file' &&
        node.contentStatus === 'too-large'
    ) {
        return 'CONTENT TOO LARGE';
    }

    if (
        node.type === 'file' &&
        node.contentStatus === 'available'
    ) {
        return 'CREATE + CONTENT';
    }

    if (
        node.type === 'file' &&
        node.content !== undefined
    ) {
        return 'CREATE + CONTENT';
    }

    return 'CREATE';
}

function escapeHtml(
    value: string
): string {
    return value
        .replace(
            /&/g,
            '&amp;'
        )
        .replace(
            /</g,
            '&lt;'
        )
        .replace(
            />/g,
            '&gt;'
        )
        .replace(
            /"/g,
            '&quot;'
        )
        .replace(
            /'/g,
            '&#039;'
        );
}

export function countFilesWithContent(
    root: TreeNode
): number {
    let count = 0;

    function visit(
        node: TreeNode
    ): void {
        if (
            node.type === 'file' &&
            (
                node.contentStatus === 'available' ||
                (
                    node.contentStatus === undefined &&
                    node.content !== undefined
                )
            )
        ) {
            count++;
        }

        for (
            const child of node.children ?? []
        ) {
            visit(child);
        }
    }

    visit(root);

    return count;
}

export function countFilesWithStatus(
    root: TreeNode,
    status:
        | 'redacted'
        | 'binary'
        | 'too-large'
): number {
    let count = 0;

    function visit(
        node: TreeNode
    ): void {
        if (
            node.type === 'file' &&
            node.contentStatus === status
        ) {
            count++;
        }

        for (
            const child of node.children ?? []
        ) {
            visit(child);
        }
    }

    visit(root);

    return count;
}