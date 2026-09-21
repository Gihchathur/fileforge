import * as vscode from 'vscode';

import { TreeNode } from '../tree/types';
import { ContentSummary } from '../tree/contentSummary';

import { renderPreviewShell } from './shared/previewShell';

import {
    PreviewTreeNode,
    PreviewTreeStatus,
    renderPreviewTree
} from './shared/previewTree';

import { icon } from './shared/previewIcons';

interface ImportPreview {
    create: string[];
    existing: string[];
}

export async function showImportPreview(
    root: TreeNode,
    preview: ImportPreview
): Promise<boolean> {
    return new Promise(resolve => {
        const panel =
            vscode.window.createWebviewPanel(
                'fileforgeImportPreview',
                'FileForge Import Preview',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

        const nonce = getNonce();

        panel.webview.html =
            renderImportPreview(
                root,
                preview,
                nonce
            );

        let resolved = false;

        const finish = (
            value: boolean
        ): void => {
            if (resolved) {
                return;
            }

            resolved = true;

            resolve(value);

            panel.dispose();
        };

        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'create':
                        finish(true);
                        break;

                    case 'cancel':
                        finish(false);
                        break;
                }
            },
            undefined,
            []
        );

        panel.onDidDispose(() => {
            if (!resolved) {
                resolved = true;
                resolve(false);
            }
        });
    });
}

function renderImportPreview(
    root: TreeNode,
    preview: ImportPreview,
    nonce: string
): string {
    const contentSummary =
        getContentSummary(root);

    const totalItems =
        countNodes(root);

    const stats = [
        {
            label: 'Create',
            value: preview.create.length,
            detail: 'New items'
        },
        {
            label: 'Keep',
            value: preview.existing.length,
            detail: 'Existing items'
        },
        {
            label: 'Files',
            value: countFiles(root),
            detail: 'Files in import'
        },
        {
            label: 'Folders',
            value: countDirectories(root),
            detail: 'Folders in import'
        }
    ];

    const body = `
        <div class="ff-message">
            Existing files will remain unchanged.
            Review the structure and content status
            before creating the files.
        </div>

        <div class="ff-toolbar">
            <div class="ff-toolbar-left">

                <div class="ff-search">
                    <span
                        class="ff-search-icon"
                        aria-hidden="true"
                    >
                        ${icon('search', 14)}
                    </span>

                    <input
                        id="tree-search"
                        class="ff-search-input"
                        type="search"
                        placeholder="Search files and folders..."
                        autocomplete="off"
                    />
                </div>

            </div>

            <div class="ff-toolbar-right">
                <span
                    id="search-count"
                    class="ff-toolbar-label"
                >
                    ${totalItems} items
                </span>
            </div>
        </div>

        <section class="ff-panel">

            <div class="ff-panel-header">

                <div class="ff-panel-title">

                    <span
                        class="ff-panel-icon"
                        aria-hidden="true"
                    >
                        ${icon('download', 15)}
                    </span>

                    <span>
                        Import Structure
                    </span>

                </div>

                <div class="ff-panel-meta">
                    Keep existing files
                </div>

            </div>

            ${renderPreviewTree(
                createImportTree(
                    root,
                    preview,
                    ''
                ),
                {
                    showStatus: true,
                    defaultExpanded: true
                }
            )}

        </section>

        ${renderContentSummary(
            contentSummary
        )}
    `;

    const footerActions = `
        <button
            class="ff-button secondary"
            type="button"
            id="cancel-import"
        >
            Cancel
        </button>

        <button
            class="ff-button"
            type="button"
            id="create-import"
        >
            <span
                class="ff-button-icon"
                aria-hidden="true"
            >
                ${icon('new-file', 15)}
            </span>

            Create Files
        </button>
    `;

    return renderPreviewShell({
        title: 'Import File Structure',

        subtitle:
            'Review what FileForge will create before making any changes to the workspace.',

        eyebrow: 'FileForge Import',

        headerIcon:
            icon('download', 14),

        stats,

        body,

        footerInfo:
            `${preview.create.length} item(s) will be created. ` +
            `${preview.existing.length} existing item(s) will be kept.`,

        footerActions,

        nonce,

        script: getImportScript(
            totalItems
        )
    });
}

function createImportTree(
    node: TreeNode,
    preview: ImportPreview,
    parentPath: string
): PreviewTreeNode {
    const currentPath =
        parentPath
            ? `${parentPath}/${node.name}`
            : node.name;

    return {
        ...node,

        status: getNodeStatus(
            node,
            currentPath,
            preview
        ),

        children:
            (node.children ?? []).map(
                child =>
                    createImportTree(
                        child,
                        preview,
                        currentPath
                    )
            )
    };
}

function getNodeStatus(
    node: TreeNode,
    currentPath: string,
    preview: ImportPreview
): PreviewTreeStatus {
    const normalizedPath =
        normalizePath(currentPath);

    const isCreate =
        preview.create.some(
            path =>
                normalizePath(path) ===
                normalizedPath
        );

    if (!isCreate) {
        return 'keep';
    }

    if (node.type !== 'file') {
        return 'create';
    }

    switch (node.contentStatus) {
        case 'redacted':
            return 'redacted';

        case 'binary':
            return 'binary';

        case 'too-large':
            return 'too-large';

        case 'available':
            return 'create-content';

        default:
            return node.content !== undefined
                ? 'create-content'
                : 'create';
    }
}

function getContentSummary(
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
                    if (
                        node.content !==
                        undefined
                    ) {
                        summary.available++;
                    }

                    break;
            }
        }

        for (
            const child of
                node.children ?? []
        ) {
            visit(child);
        }
    }

    visit(root);

    return summary;
}

function renderContentSummary(
    summary: ContentSummary
): string {
    const protectedCount =
        summary.redacted +
        summary.binary +
        summary.tooLarge;

    if (
        summary.available === 0 &&
        protectedCount === 0
    ) {
        return '';
    }

    const details: string[] = [];

    if (summary.available > 0) {
        details.push(
            `${summary.available} with content`
        );
    }

    if (summary.redacted > 0) {
        details.push(
            `${summary.redacted} redacted`
        );
    }

    if (summary.binary > 0) {
        details.push(
            `${summary.binary} binary`
        );
    }

    if (summary.tooLarge > 0) {
        details.push(
            `${summary.tooLarge} too large`
        );
    }

    return `
        <div
            class="ff-message"
            style="margin-top: 12px; margin-bottom: 0;"
        >
            <strong>Content:</strong>
            ${escapeHtml(
                details.join(' · ')
            )}
        </div>
    `;
}

function countNodes(
    root: TreeNode
): number {
    let count = 0;

    function visit(
        node: TreeNode
    ): void {
        count++;

        for (
            const child of
                node.children ?? []
        ) {
            visit(child);
        }
    }

    visit(root);

    return count;
}

function countFiles(
    root: TreeNode
): number {
    let count = 0;

    function visit(
        node: TreeNode
    ): void {
        if (node.type === 'file') {
            count++;
        }

        for (
            const child of
                node.children ?? []
        ) {
            visit(child);
        }
    }

    visit(root);

    return count;
}

function countDirectories(
    root: TreeNode
): number {
    let count = 0;

    function visit(
        node: TreeNode
    ): void {
        if (
            node.type ===
            'directory'
        ) {
            count++;
        }

        for (
            const child of
                node.children ?? []
        ) {
            visit(child);
        }
    }

    visit(root);

    return count;
}

function normalizePath(
    value: string
): string {
    return value
        .replace(/\\/g, '/')
        .replace(/^\/+/, '')
        .replace(/\/+$/, '');
}

function getImportScript(
    totalItems: number
): string {
    return `
        const vscode =
            acquireVsCodeApi();

        const createButton =
            document.getElementById(
                'create-import'
            );

        const cancelButton =
            document.getElementById(
                'cancel-import'
            );

        const searchInput =
            document.getElementById(
                'tree-search'
            );

        const searchCount =
            document.getElementById(
                'search-count'
            );

        if (createButton) {
            createButton.addEventListener(
                'click',
                () => {
                    vscode.postMessage({
                        command: 'create'
                    });
                }
            );
        }

        if (cancelButton) {
            cancelButton.addEventListener(
                'click',
                () => {
                    vscode.postMessage({
                        command: 'cancel'
                    });
                }
            );
        }

        document
            .querySelectorAll(
                '[data-tree-toggle]'
            )
            .forEach(button => {
                button.addEventListener(
                    'click',
                    () => {
                        const node =
                            button.closest(
                                '.ff-tree-node'
                            );

                        if (!node) {
                            return;
                        }

                        const children =
                            node.querySelector(
                                ':scope > [data-tree-children]'
                            );

                        if (!children) {
                            return;
                        }

                        const hidden =
                            children.hasAttribute(
                                'hidden'
                            );

                        if (hidden) {
                            children.removeAttribute(
                                'hidden'
                            );

                            button.classList.add(
                                'expanded'
                            );

                            button.setAttribute(
                                'aria-label',
                                'Collapse'
                            );
                        } else {
                            children.setAttribute(
                                'hidden',
                                ''
                            );

                            button.classList.remove(
                                'expanded'
                            );

                            button.setAttribute(
                                'aria-label',
                                'Expand'
                            );
                        }
                    }
                );
            });

        if (searchInput) {
            searchInput.addEventListener(
                'input',
                () => {
                    filterTree(
                        searchInput.value
                    );
                }
            );
        }

        function filterTree(query) {
            const normalized =
                query
                    .trim()
                    .toLowerCase();

            const nodes =
                Array.from(
                    document.querySelectorAll(
                        '.ff-tree-node'
                    )
                );

            let visible = 0;

            nodes.forEach(node => {
                const name =
                    node.dataset.nodeName ||
                    '';

                const directMatch =
                    !normalized ||
                    name.includes(
                        normalized
                    );

                const descendants =
                    Array.from(
                        node.querySelectorAll(
                            ':scope > .ff-tree-children .ff-tree-node'
                        )
                    );

                const descendantMatch =
                    normalized &&
                    descendants.some(
                        child =>
                            (
                                child
                                    .dataset
                                    .nodeName ||
                                ''
                            ).includes(
                                normalized
                            )
                    );

                const shouldShow =
                    !normalized ||
                    directMatch ||
                    descendantMatch;

                if (shouldShow) {
                    node.classList.remove(
                        'hidden'
                    );
                } else {
                    node.classList.add(
                        'hidden'
                    );
                }

                if (directMatch) {
                    visible++;
                }
            });

            if (searchCount) {
                searchCount.textContent =
                    normalized
                        ? visible + ' matches'
                        : '${totalItems} items';
            }
        }
    `;
}

function escapeHtml(
    value: string
): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getNonce(): string {
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let result = '';

    for (let i = 0; i < 32; i++) {
        result +=
            characters.charAt(
                Math.floor(
                    Math.random() *
                        characters.length
                )
            );
    }

    return result;
}