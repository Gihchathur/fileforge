import { TreeNode } from '../../tree/types';
import {
    icon
} from './previewIcons';

export type PreviewTreeStatus =
    | 'create'
    | 'keep'
    | 'create-content'
    | 'redacted'
    | 'binary'
    | 'too-large';

export interface PreviewTreeNode
    extends TreeNode {
    status?: PreviewTreeStatus;
}

export interface PreviewTreeOptions {
    showStatus?: boolean;
    defaultExpanded?: boolean;
}

export function renderPreviewTree(
    root: PreviewTreeNode,
    options: PreviewTreeOptions = {}
): string {
    const showStatus =
        options.showStatus ?? true;

    const defaultExpanded =
        options.defaultExpanded ?? true;

    return `
        <div
            class="ff-tree"
            id="ff-preview-tree"
            data-default-expanded="${
                defaultExpanded
                    ? 'true'
                    : 'false'
            }"
        >
            ${renderNode(
                root,
                0,
                showStatus,
                defaultExpanded
            )}
        </div>
    `;
}

function renderNode(
    node: PreviewTreeNode,
    depth: number,
    showStatus: boolean,
    defaultExpanded: boolean
): string {
    const children =
        node.children ?? [];

    const hasChildren =
        node.type === 'directory' &&
        children.length > 0;

    const statusHtml =
        showStatus && node.status
            ? renderStatus(node.status)
            : '';

    const nodeIcon =
        node.type === 'directory'
            ? icon('folder', 15)
            : icon('file', 15);

    return `
        <div
            class="ff-tree-node"
            data-node-name="${escapeAttribute(
                node.name
            )}"
            data-node-type="${node.type}"
            data-depth="${depth}"
        >
            <div
                class="ff-tree-row"
                data-searchable="${escapeAttribute(
                    node.name.toLowerCase()
                )}"
            >
                <span
                    class="ff-tree-indent"
                    style="width: ${
                        depth * 18
                    }px"
                ></span>

                ${
                    hasChildren
                        ? `
                            <button
                                class="ff-tree-toggle"
                                type="button"
                                aria-label="${
                                    defaultExpanded
                                        ? 'Collapse'
                                        : 'Expand'
                                } ${escapeAttribute(
                                    node.name
                                )}"
                                data-tree-toggle
                            >
                                ${
                                    defaultExpanded
                                        ? icon(
                                              'chevron-down',
                                              14
                                          )
                                        : icon(
                                              'chevron-right',
                                              14
                                          )
                                }
                            </button>
                        `
                        : `
                            <span
                                class="ff-tree-toggle empty"
                                aria-hidden="true"
                            ></span>
                        `
                }

                <span
                    class="ff-tree-icon ${
                        node.type === 'directory'
                            ? 'directory'
                            : 'file'
                    }"
                >
                    ${nodeIcon}
                </span>

                <span
                    class="ff-tree-name"
                    title="${escapeAttribute(
                        node.name
                    )}"
                >
                    ${escapeHtml(node.name)}
                </span>

                <span
                    class="ff-tree-spacer"
                ></span>

                ${statusHtml}
            </div>

            ${
                hasChildren
                    ? `
                        <div
                            class="ff-tree-children"
                            data-tree-children
                            ${
                                defaultExpanded
                                    ? ''
                                    : 'hidden'
                            }
                        >
                            ${children
                                .map(child =>
                                    renderNode(
                                        child,
                                        depth + 1,
                                        showStatus,
                                        defaultExpanded
                                    )
                                )
                                .join('')}
                        </div>
                    `
                    : ''
            }
        </div>
    `;
}

function renderStatus(
    status: PreviewTreeStatus
): string {
    const statusMap: Record<
        PreviewTreeStatus,
        {
            label: string;
            className: string;
        }
    > = {
        create: {
            label: 'CREATE',
            className: 'create'
        },

        keep: {
            label: 'KEEP',
            className: 'keep'
        },

        'create-content': {
            label: 'CREATE + CONTENT',
            className: 'content'
        },

        redacted: {
            label: 'CONTENT REDACTED',
            className: 'warning'
        },

        binary: {
            label: 'BINARY CONTENT',
            className: 'warning'
        },

        'too-large': {
            label: 'CONTENT TOO LARGE',
            className: 'warning'
        }
    };

    const config =
        statusMap[status];

    return `
        <span
            class="ff-status ${config.className}"
            title="${escapeAttribute(
                config.label
            )}"
        >
            ${escapeHtml(config.label)}
        </span>
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

function escapeAttribute(
    value: string
): string {
    return escapeHtml(value);
}