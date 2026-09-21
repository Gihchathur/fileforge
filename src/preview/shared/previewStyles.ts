export function getPreviewStyles(): string {
    return `
        :root {
            color-scheme: dark;

            --ff-bg: var(--vscode-editor-background);
            --ff-panel: var(--vscode-editorWidget-background);
            --ff-panel-alt: var(--vscode-sideBar-background);
            --ff-border: var(--vscode-panel-border);
            --ff-border-soft: color-mix(
                in srgb,
                var(--vscode-panel-border) 65%,
                transparent
            );

            --ff-text: var(--vscode-foreground);
            --ff-muted: var(--vscode-descriptionForeground);
            --ff-accent: var(--vscode-textLink-foreground);

            --ff-button:
                var(--vscode-button-background);
            --ff-button-hover:
                var(--vscode-button-hoverBackground);
            --ff-button-text:
                var(--vscode-button-foreground);

            --ff-input:
                var(--vscode-input-background);
            --ff-input-border:
                var(--vscode-input-border);

            --ff-success: #4ec9b0;
            --ff-warning: #cca700;
            --ff-info: #3794ff;

            --ff-radius: 5px;
        }

        * {
            box-sizing: border-box;
        }

        html,
        body {
            margin: 0;
            padding: 0;
            min-height: 100%;
            background: var(--ff-bg);
            color: var(--ff-text);

            font-family:
                var(--vscode-font-family),
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                sans-serif;

            font-size: var(--vscode-font-size);
        }

        body {
            padding: 20px 24px 24px;
        }

        button,
        input {
            font: inherit;
        }

        button {
            border: 0;
        }

        .ff-shell {
            width: 100%;
            max-width: 1180px;
            margin: 0 auto;
        }

        /* ---------------- HEADER ---------------- */

        .ff-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 18px;
        }

        .ff-header-main {
            min-width: 0;
        }

        .ff-eyebrow {
            display: flex;
            align-items: center;
            gap: 6px;

            margin-bottom: 5px;

            color: var(--ff-muted);
            font-size: 10px;
            font-weight: 600;

            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .ff-eyebrow-icon {
            display: inline-flex;
            align-items: center;
            color: var(--ff-accent);
        }

        .ff-title {
            margin: 0;

            color: var(--ff-text);

            font-size: 23px;
            line-height: 1.25;
            font-weight: 600;
        }

        .ff-subtitle {
            margin: 5px 0 0;

            max-width: 760px;

            color: var(--ff-muted);

            font-size: 12px;
            line-height: 1.45;
        }

        /* ---------------- BUTTONS ---------------- */

        .ff-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;

            gap: 7px;

            height: 32px;
            min-height: 32px;

            padding: 0 12px;

            border: 1px solid transparent;
            border-radius: 5px;

            color:
                var(--vscode-button-foreground);

            background:
                var(--vscode-button-background);

            cursor: pointer;

            font-size: 12px;
            font-weight: 500;

            transition:
                background-color 100ms ease,
                border-color 100ms ease;
        }

        .ff-button:hover {
            background:
                var(--vscode-button-hoverBackground);
        }

        .ff-button:focus-visible {
            outline:
                1px solid
                var(--vscode-focusBorder);

            outline-offset: 1px;
        }

        .ff-button.secondary {
            color:
                var(--vscode-foreground);

            background:
                var(--vscode-button-secondaryBackground);

            border-color:
                var(--vscode-button-border);
        }

        .ff-button.secondary:hover {
            background:
                var(--vscode-button-secondaryHoverBackground);
        }

        .ff-button-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;

            width: 16px;
            height: 16px;

            flex: 0 0 16px;

            color: currentColor;
        }

        .ff-button-icon .ff-icon {
            width: 15px;
            height: 15px;

            stroke-width: 1.4;
        }

        /* ---------------- STATS ---------------- */

        .ff-stats {
            display: grid;
            grid-template-columns:
                repeat(4, minmax(0, 1fr));

            gap: 8px;

            margin-bottom: 14px;
        }

        .ff-stat {
            min-width: 0;

            padding: 10px 12px;

            background: var(--ff-panel-alt);

            border: 1px solid
                var(--ff-border-soft);

            border-radius: 7px;
        }

        .ff-stat-label {
            margin-bottom: 4px;

            color: var(--ff-muted);

            font-size: 10px;
            font-weight: 600;

            letter-spacing: 0.05em;
            text-transform: uppercase;
        }

        .ff-stat-value {
            color: var(--ff-text);

            font-size: 18px;
            line-height: 1.15;
            font-weight: 600;
        }

        .ff-stat-detail {
            margin-top: 3px;

            color: var(--ff-muted);

            font-size: 10px;
        }

        /* ---------------- TOOLBAR ---------------- */

        .ff-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;

            gap: 12px;

            margin-bottom: 9px;
        }

        .ff-toolbar-left,
        .ff-toolbar-right {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .ff-search {
            position: relative;
            width: 280px;
        }

        .ff-search-icon {
            position: absolute;

            left: 9px;
            top: 50%;

            display: flex;

            color: var(--ff-muted);

            transform: translateY(-50%);

            pointer-events: none;
        }

        .ff-search-input {
            width: 100%;
            height: 30px;

            padding:
                0 9px 0 28px;

            color: var(--ff-text);
            background: var(--ff-input);

            border:
                1px solid
                var(--ff-input-border);

            border-radius: 4px;

            outline: none;

            font-size: 12px;
        }

        .ff-search-input:focus {
            border-color:
                var(--vscode-focusBorder);
        }

        .ff-search-input::placeholder {
            color: var(--ff-muted);
        }

        .ff-toolbar-label {
            color: var(--ff-muted);
            font-size: 11px;
        }

        /* ---------------- PANEL ---------------- */

        .ff-panel {
            overflow: hidden;

            background: var(--ff-panel);

            border:
                1px solid
                var(--ff-border-soft);

            border-radius: 7px;
        }

        .ff-panel-header {
            display: flex;
            align-items: center;
            justify-content: space-between;

            min-height: 38px;

            padding: 0 12px;

            border-bottom:
                1px solid
                var(--ff-border-soft);
        }

        .ff-panel-title {
            display: flex;
            align-items: center;

            gap: 6px;

            color: var(--ff-text);

            font-size: 11px;
            font-weight: 600;
        }

        .ff-panel-icon {
            display: inline-flex;
            align-items: center;

            color: var(--ff-muted);
        }

        .ff-panel-meta {
            color: var(--ff-muted);
            font-size: 10px;
        }

        /* ---------------- TREE ---------------- */

        .ff-tree {
            padding: 5px 0;
        }

        .ff-tree-row {
            display: flex;
            align-items: center;

            height: 25px;
            min-height: 25px;

            padding: 0 10px;

            border-left:
                2px solid transparent;

            color: var(--ff-text);

            font-size: 12px;
        }

        .ff-tree-row:hover {
            background:
                var(--vscode-list-hoverBackground);
        }

        .ff-tree-node.hidden {
            display: none;
        }

        .ff-tree-indent {
            flex: 0 0 auto;
        }

        .ff-tree-toggle {
            display: inline-flex;
            align-items: center;
            justify-content: center;

            flex: 0 0 16px;

            width: 16px;
            height: 20px;

            margin: 0;
            padding: 0;

            color: var(--ff-muted);
            background: transparent;

            border-radius: 3px;

            cursor: pointer;
        }

        .ff-tree-toggle:hover {
            color: var(--ff-text);

            background:
                var(--vscode-toolbar-hoverBackground);
        }

        .ff-tree-toggle.empty {
            cursor: default;
            visibility: hidden;
        }

        .ff-tree-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;

            flex: 0 0 17px;

            width: 17px;
            height: 17px;

            margin-right: 5px;

            color:
                var(--vscode-symbolIcon-fileForeground);
        }

        .ff-tree-icon.directory {
            color:
                var(--vscode-symbolIcon-folderForeground);
        }

        .ff-tree-name {
            min-width: 0;

            overflow: hidden;

            text-overflow: ellipsis;
            white-space: nowrap;

            font-family:
                var(--vscode-editor-font-family),
                var(--vscode-font-family),
                monospace;

            font-size: 12px;
        }

        .ff-tree-spacer {
            flex: 1;
            min-width: 8px;
        }

        /* ---------------- STATUS ---------------- */

        .ff-status {
            display: inline-flex;
            align-items: center;
            justify-content: center;

            min-height: 17px;

            padding: 0 6px;

            border-radius: 3px;

            font-size: 8px;
            line-height: 1;

            font-weight: 700;

            letter-spacing: 0.03em;

            white-space: nowrap;
        }

        .ff-status.create {
            color: var(--ff-success);

            background:
                color-mix(
                    in srgb,
                    var(--ff-success) 12%,
                    transparent
                );
        }

        .ff-status.keep {
            color: var(--ff-muted);

            background:
                color-mix(
                    in srgb,
                    var(--ff-muted) 12%,
                    transparent
                );
        }

        .ff-status.content {
            color: var(--ff-info);

            background:
                color-mix(
                    in srgb,
                    var(--ff-info) 12%,
                    transparent
                );
        }

        .ff-status.warning {
            color: var(--ff-warning);

            background:
                color-mix(
                    in srgb,
                    var(--ff-warning) 12%,
                    transparent
                );
        }

        /* ---------------- JSON ---------------- */

        .ff-code-panel {
            width: 100%;
            overflow: hidden;

            background:
                var(--vscode-editor-background);
        }

        .ff-code {
            width: 100%;
            max-height: 560px;

            overflow-x: auto;
            overflow-y: auto;

            padding: 6px 0;

            font-family:
                var(--vscode-editor-font-family),
                Consolas,
                "Courier New",
                monospace;

            font-size:
                var(--vscode-editor-font-size);

            line-height: 20px;

            white-space: normal;
        }

        .ff-code-line {
            display: grid;

            grid-template-columns:
                42px max-content;

            width: max-content;
            min-width: 100%;

            height: 20px;
            min-height: 20px;
            max-height: 20px;

            margin: 0;
            padding: 0 12px;

            line-height: 20px;

            white-space: pre;

            font-family:
                var(--vscode-editor-font-family),
                Consolas,
                "Courier New",
                monospace;

            font-size:
                var(--vscode-editor-font-size);
        }

        .ff-code-line:hover {
            background:
                var(--vscode-editor-lineHighlightBackground);
        }

        .ff-code-line-number {
            display: block;

            width: 48px;
            height: 20px;

            padding-right: 12px;

            color:
                var(--vscode-editorLineNumber-foreground);

            line-height: 20px;

            text-align: right;

            user-select: none;
        }

        .ff-code-text {
            display: block;

            height: 20px;

            line-height: 20px;

            white-space: pre;
        }

        /* JSON syntax */

        .ff-json-key {
            color:
                var(--vscode-symbolIcon-propertyForeground);
        }

        .ff-json-string {
            color:
                var(--vscode-debugTokenExpression-string);
        }

        .ff-json-number {
            color:
                var(--vscode-debugTokenExpression-number);
        }

        .ff-json-keyword {
            color:
                var(--vscode-debugTokenExpression-boolean);
        }

        .ff-json-punctuation {
            color:
                var(--vscode-editor-foreground);
        }

        /* ---------------- MESSAGE ---------------- */

        .ff-message {
            margin-bottom: 10px;

            padding: 8px 10px;

            color: var(--ff-muted);

            background:
                var(--ff-panel-alt);

            border:
                1px solid
                var(--ff-border-soft);

            border-radius: 5px;

            font-size: 11px;
            line-height: 1.4;
        }

        /* ---------------- FOOTER ---------------- */

        .ff-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;

            gap: 12px;

            margin-top: 12px;
            padding-top: 10px;

            border-top:
                1px solid
                var(--ff-border-soft);
        }

        .ff-footer-info {
            color: var(--ff-muted);
            font-size: 10px;
        }

        .ff-footer-actions {
            display: flex;
            gap: 6px;
        }

        /* ---------------- SVG ---------------- */

        .ff-icon {
            display: block;

            flex: 0 0 auto;

            width: 100%;
            height: 100%;

            stroke: currentColor;

            stroke-width: 1.25;

            stroke-linecap: round;
            stroke-linejoin: round;
        }

        /* ---------------- RESPONSIVE ---------------- */

        @media (max-width: 760px) {
            body {
                padding: 14px;
            }

            .ff-stats {
                grid-template-columns:
                    repeat(2, minmax(0, 1fr));
            }

            .ff-header {
                flex-direction: column;
            }

            .ff-search {
                width: 100%;
            }

            .ff-footer {
                align-items: stretch;
                flex-direction: column;
            }

            .ff-footer-actions {
                justify-content: flex-end;
            }
        }
    `;
}