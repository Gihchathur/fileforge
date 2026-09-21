import * as vscode from 'vscode';

import { TreeNode } from '../tree/types';
import { TreeStats } from '../tree/treeStats';
import { ContentSummary } from '../tree/contentSummary';

import {
    PreviewTreeNode,
    renderPreviewTree
} from '../preview/shared/previewTree';

import { icon } from '../preview/shared/previewIcons';
import { renderPreviewShell } from '../preview/shared/previewShell';

interface ExportPreviewOptions {
    title: string;
    content: string;
    language: string;
    root: TreeNode;
    stats: TreeStats;
    contentSummary?: ContentSummary;
}

export async function showExportPreview(
    options: ExportPreviewOptions
): Promise<void> {
    const panel =
        vscode.window.createWebviewPanel(
            'fileforgeExportPreview',
            options.title,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

    const nonce = getNonce();

    panel.webview.html =
        renderExportPreview(
            options,
            nonce
        );

    panel.webview.onDidReceiveMessage(
        async message => {
            switch (message.command) {
                case 'copy':
                    await vscode.env.clipboard.writeText(
                        options.content
                    );

                    vscode.window.showInformationMessage(
                        'FileForge: Export copied to clipboard.'
                    );

                    break;

                case 'openEditor': {
                    const document =
                        await vscode.workspace.openTextDocument({
                            content: options.content,
                            language: options.language
                        });

                    await vscode.window.showTextDocument(
                        document,
                        vscode.ViewColumn.One
                    );

                    break;
                }

                case 'close':
                    panel.dispose();
                    break;
            }
        },
        undefined,
        []
    );
}

function renderExportPreview(
    options: ExportPreviewOptions,
    nonce: string
): string {
    const isJson =
        options.language === 'json';

    const contentSummary =
        options.contentSummary;

    const stats = [
        {
            label: 'Files',
            value: options.stats.files
        },
        {
            label: 'Folders',
            value: options.stats.directories
        },
        {
            label: 'Total',
            value: options.stats.total
        },
        {
            label: 'Depth',
            value: options.stats.maxDepth
        }
    ];

    if (contentSummary) {
        stats.push(
            {
                label: 'With content',
                value: contentSummary.available
            },
            {
                label: 'Protected',
                value:
                    contentSummary.redacted +
                    contentSummary.binary +
                    contentSummary.tooLarge
            }
        );
    }

    const body = `
        <div class="ff-toolbar">
            <div class="ff-toolbar-left">
                <div class="ff-search">
                    <span
                        class="ff-search-icon"
                        aria-hidden="true"
                    >
                        ${icon('search', 13)}
                    </span>

                    <input
                        id="tree-search"
                        class="ff-search-input"
                        type="search"
                        placeholder="${
                            isJson
                                ? 'Search JSON...'
                                : 'Search files and folders...'
                        }"
                        autocomplete="off"
                    />
                </div>
            </div>

            <div class="ff-toolbar-right">
                <span
                    id="search-count"
                    class="ff-toolbar-label"
                >
                    ${
                        isJson
                            ? `${options.content.split(/\r?\n/).length} lines`
                            : `${options.stats.total} items`
                    }
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
                        ${
                            isJson
                                ? icon('json', 14)
                                : icon('files', 14)
                        }
                    </span>

                    <span>
                        ${
                            isJson
                                ? 'Project JSON'
                                : 'Project Structure'
                        }
                    </span>
                </div>

                <div class="ff-panel-meta">
                    ${
                        isJson
                            ? 'JSON + content'
                            : 'File tree'
                    }
                </div>

            </div>

            ${
                isJson
                    ? renderJsonViewer(
                          options.content
                      )
                    : renderPreviewTree(
                          createExportTree(
                              options.root
                          ),
                          {
                              showStatus: false,
                              defaultExpanded: true
                          }
                      )
            }

        </section>
    `;

    const footerActions = `
        <button
            class="ff-button secondary"
            type="button"
            id="open-editor"
        >
            <span
                class="ff-button-icon"
                aria-hidden="true"
            >
                ${icon('edit', 15)}
            </span>

            Open in Editor
        </button>

        <button
            class="ff-button"
            type="button"
            id="copy-content"
        >
            <span
                class="ff-button-icon"
                aria-hidden="true"
            >
                ${icon('copy', 15)}
            </span>

            Copy to Clipboard
        </button>
    `;

    return renderPreviewShell({
        title: options.title,

        subtitle: isJson
            ? 'Review the exported project structure and file content before copying.'
            : 'Review the project file structure before copying it to the clipboard.',

        eyebrow: 'FileForge Export',

        headerIcon: isJson
            ? icon('json', 13)
            : icon('files', 13),

        stats,

        body,

        footerInfo: isJson
            ? 'Sensitive, binary, and oversized files are represented safely.'
            : 'Folders are shown before files and sorted alphabetically.',

        footerActions,

        nonce,

        script: getExportScript(
            isJson,
            getTreeItemCount(options.root),
            isJson
                ? options.content.split(/\r?\n/).length
                : 0
        )
    });
}

function createExportTree(
    root: TreeNode
): PreviewTreeNode {
    return {
        ...root,

        children:
            (root.children ?? []).map(
                child =>
                    createExportTree(child)
            )
    };
}

/**
 * Render JSON as a normal block-based
 * editor surface.
 *
 * Do NOT put div elements inside <pre>.
 */
function renderJsonViewer(
    content: string
): string {
    const lines =
        content.split(/\r?\n/);

    return `
        <div
            class="ff-code-panel"
            id="json-viewer"
        >
            <div class="ff-code">
                ${lines
                    .map(
                        (line, index) => `
                            <div
                                class="ff-code-line"
                                data-line="${
                                    index + 1
                                }"
                            >
                                <span
                                    class="ff-code-line-number"
                                >${
                                    index + 1
                                }</span>

                                <span
                                    class="ff-code-text"
                                    data-json-line
                                >${highlightJsonLine(
                                    line
                                )}</span>
                            </div>
                        `
                    )
                    .join('')}
            </div>
        </div>
    `;
}

function highlightJsonLine(
    line: string
): string {
    let result = '';

    let index = 0;

    while (index < line.length) {
        const character =
            line[index];

        if (character === '"') {
            let end =
                index + 1;

            let escaped = false;

            while (end < line.length) {
                const current =
                    line[end];

                if (
                    current === '"' &&
                    !escaped
                ) {
                    break;
                }

                if (
                    current === '\\' &&
                    !escaped
                ) {
                    escaped = true;
                } else {
                    escaped = false;
                }

                end++;
            }

            const raw =
                line.slice(
                    index,
                    Math.min(
                        end + 1,
                        line.length
                    )
                );

            let next =
                end + 1;

            while (
                next < line.length &&
                /\s/.test(
                    line[next]
                )
            ) {
                next++;
            }

            const className =
                line[next] === ':'
                    ? 'ff-json-key'
                    : 'ff-json-string';

            result +=
                `<span class="${className}">` +
                escapeHtml(raw) +
                '</span>';

            index =
                Math.min(
                    end + 1,
                    line.length
                );

            continue;
        }

        const numberMatch =
            line
                .slice(index)
                .match(
                    /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/
                );

        if (numberMatch) {
            result +=
                `<span class="ff-json-number">` +
                escapeHtml(
                    numberMatch[0]
                ) +
                '</span>';

            index +=
                numberMatch[0].length;

            continue;
        }

        const keywordMatch =
            line
                .slice(index)
                .match(
                    /^(true|false|null)\b/
                );

        if (keywordMatch) {
            result +=
                `<span class="ff-json-keyword">` +
                keywordMatch[0] +
                '</span>';

            index +=
                keywordMatch[0].length;

            continue;
        }

        if (
            '{}[],:'.includes(
                character
            )
        ) {
            result +=
                `<span class="ff-json-punctuation">` +
                escapeHtml(character) +
                '</span>';

            index++;
            continue;
        }

        result += escapeHtml(
            character
        );

        index++;
    }

    return result || '&nbsp;';
}

function getExportScript(
    isJson: boolean,
    totalItems: number,
    jsonLineCount: number
): string {
    return `
        const vscode =
            acquireVsCodeApi();

        const copyButton =
            document.getElementById(
                'copy-content'
            );

        const openEditorButton =
            document.getElementById(
                'open-editor'
            );

        const searchInput =
            document.getElementById(
                'tree-search'
            );

        const searchCount =
            document.getElementById(
                'search-count'
            );

        if (copyButton) {
            copyButton.addEventListener(
                'click',
                () => {
                    vscode.postMessage({
                        command: 'copy'
                    });
                }
            );
        }

        if (openEditorButton) {
            openEditorButton.addEventListener(
                'click',
                () => {
                    vscode.postMessage({
                        command: 'openEditor'
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
                        } else {
                            children.setAttribute(
                                'hidden',
                                ''
                            );
                        }
                    }
                );
            });

        if (searchInput) {
            searchInput.addEventListener(
                'input',
                () => {
                    filterContent(
                        searchInput.value
                    );
                }
            );
        }

        function filterContent(query) {
            const normalized =
                query
                    .trim()
                    .toLowerCase();

            ${
                isJson
                    ? `
                        const lines =
                            Array.from(
                                document.querySelectorAll(
                                    '[data-json-line]'
                                )
                            );

                        let matches = 0;

                        lines.forEach(
                            line => {
                                const value =
                                    line.textContent
                                        .toLowerCase();

                                const match =
                                    !normalized ||
                                    value.includes(
                                        normalized
                                    );

                                const row =
                                    line.closest(
                                        '.ff-code-line'
                                    );

                                if (!row) {
                                    return;
                                }

                                row.style.display =
                                    match
                                        ? 'flex'
                                        : 'none';

                                if (match) {
                                    matches++;
                                }
                            }
                        );

                        if (searchCount) {
                            searchCount.textContent =
                                normalized
                                    ? matches + ' lines'
                                    : '${isJson ? 'JSON_LINES' : `${totalItems} items`}';
                        }
                    `
                    : `
                        const nodes =
                            Array.from(
                                document.querySelectorAll(
                                    '.ff-tree-node'
                                )
                            );

                        let visible = 0;

                        nodes.forEach(
                            node => {
                                const name =
                                    node.dataset
                                        .nodeName ||
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

                                if (
                                    directMatch
                                ) {
                                    visible++;
                                }
                            }
                        );

                        if (searchCount) {
                            searchCount.textContent =
                                normalized
                                    ? visible + ' matches'
                                    : '${totalItems} items';
                        }
                    `
            }
        }
    `;
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
            '&#39;'
        );
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

function getTreeItemCount(
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