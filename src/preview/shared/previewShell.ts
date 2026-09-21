import { getPreviewStyles } from './previewStyles';
import {
    PreviewStat,
    renderPreviewStats
} from './previewStats';

export interface PreviewShellOptions {
    title: string;
    subtitle: string;
    eyebrow?: string;
    headerIcon?: string;
    stats?: PreviewStat[];
    body: string;
    footerInfo?: string;
    footerActions?: string;
    headerActions?: string;
    nonce: string;
    script?: string;
}

export function renderPreviewShell(
    options: PreviewShellOptions
): string {
    const eyebrow =
        options.eyebrow ?? 'FileForge';

    const headerIcon =
        options.headerIcon ?? '$(files)';

    const stats =
        options.stats && options.stats.length > 0
            ? renderPreviewStats(options.stats)
            : '';

    const script =
        options.script
            ? `
                <script nonce="${escapeAttribute(
                    options.nonce
                )}">
                    ${options.script}
                </script>
            `
            : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">

    <meta
        http-equiv="Content-Security-Policy"
        content="
            default-src 'none';
            style-src 'unsafe-inline';
            script-src 'nonce-${options.nonce}';
        "
    >

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        ${escapeHtml(options.title)}
    </title>

    <style>
        ${getPreviewStyles()}
    </style>
</head>

<body>
    <main class="ff-shell">

        <header class="ff-header">
            <div class="ff-header-main">

                <div class="ff-eyebrow">
                    <span
                        class="ff-eyebrow-icon"
                        aria-hidden="true"
                    >
                        ${headerIcon}
                    </span>

                    <span>
                        ${escapeHtml(eyebrow)}
                    </span>
                </div>

                <h1 class="ff-title">
                    ${escapeHtml(options.title)}
                </h1>

                <p class="ff-subtitle">
                    ${escapeHtml(options.subtitle)}
                </p>

            </div>

            ${
                options.headerActions
                    ? `
                        <div class="ff-header-actions">
                            ${options.headerActions}
                        </div>
                    `
                    : ''
            }
        </header>

        ${stats}

        ${options.body}

        ${
            options.footerInfo ||
            options.footerActions
                ? `
                    <footer class="ff-footer">

                        <div class="ff-footer-info">
                            ${
                                options.footerInfo ??
                                ''
                            }
                        </div>

                        ${
                            options.footerActions
                                ? `
                                    <div class="ff-footer-actions">
                                        ${options.footerActions}
                                    </div>
                                `
                                : ''
                        }

                    </footer>
                `
                : ''
        }

    </main>

    ${script}
</body>
</html>`;
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