import * as vscode from 'vscode';

import { scanWorkspace } from './tree/scanner';
import { serializeTree } from './tree/serializer';
import { parseAnyTree } from './tree/parseAnyTree';
import { validateTree } from './tree/validator';
import { createTree } from './tree/creator';
import { previewTree } from './tree/preview';
import { showImportPreview } from './preview/importPreview';
import { FileForgeViewProvider } from './sidebar/fileforgeView';
import { serializeTreeWithContent } from './tree/jsonSerializer';

export function activate(
    context: vscode.ExtensionContext
) {
    const sidebarProvider =
        new FileForgeViewProvider();

    context.subscriptions.push(
        vscode.window.registerTreeDataProvider(
            'fileforge.mainView',
            sidebarProvider
        )
    );

    const scanCommand =
        vscode.commands.registerCommand(
            'fileforge.scanWorkspace',
            async () => {
                const tree =
                    await scanWorkspace();

                if (!tree) {
                    vscode.window.showErrorMessage(
                        'FileForge: No workspace is open.'
                    );
                    return;
                }

                const output =
                    serializeTree(tree);

                const document =
                    await vscode.workspace.openTextDocument({
                        content: output,
                        language: 'plaintext'
                    });

                await vscode.window.showTextDocument(
                    document
                );
            }
        );

    const copyCommand =
        vscode.commands.registerCommand(
            'fileforge.copyStructure',
            async () => {
                const tree =
                    await scanWorkspace();

                if (!tree) {
                    vscode.window.showErrorMessage(
                        'FileForge: No workspace is open.'
                    );
                    return;
                }

                const output =
                    serializeTree(tree);

                await vscode.env.clipboard.writeText(
                    output
                );

                vscode.window.showInformationMessage(
                    'FileForge: File structure copied to clipboard.'
                );
            }
        );

    const copyJsonWithContentCommand =
        vscode.commands.registerCommand(
            'fileforge.copyJsonWithContent',
            async () => {
                const workspaceFolder =
                    vscode.workspace.workspaceFolders?.[0];

                if (!workspaceFolder) {
                    vscode.window.showErrorMessage(
                        'FileForge: No workspace is open.'
                    );
                    return;
                }

                const tree =
                    await scanWorkspace();

                if (!tree) {
                    vscode.window.showErrorMessage(
                        'FileForge: Could not scan the workspace.'
                    );
                    return;
                }

                try {
                    const json =
                        await serializeTreeWithContent(
                            tree,
                            workspaceFolder.uri
                        );

                    await vscode.env.clipboard.writeText(
                        json
                    );

                    vscode.window.showInformationMessage(
                        'FileForge: JSON structure with file contents copied to clipboard.'
                    );
                } catch (error) {
                    const message =
                        error instanceof Error
                            ? error.message
                            : String(error);

                    vscode.window.showErrorMessage(
                        `FileForge: Failed to export JSON. ${message}`
                    );

                    console.error(error);
                }
            }
        );

    const testParserCommand =
        vscode.commands.registerCommand(
            'fileforge.testParser',
            async () => {
                const text =
                    await vscode.env.clipboard.readText();

                if (!text.trim()) {
                    vscode.window.showWarningMessage(
                        'FileForge: Clipboard is empty.'
                    );
                    return;
                }

                const parsed =
                    parseAnyTree(text);

                if (!parsed) {
                    vscode.window.showErrorMessage(
                        'FileForge: Could not parse the clipboard content.'
                    );
                    return;
                }

                console.log(
                    '--- PARSED TREE ---'
                );

                console.log(
                    JSON.stringify(
                        parsed,
                        null,
                        2
                    )
                );

                vscode.window.showInformationMessage(
                    'FileForge: Clipboard structure parsed successfully. Check the Debug Console.'
                );
            }
        );

    const importCommand =
        vscode.commands.registerCommand(
            'fileforge.importStructure',
            async () => {
                const text =
                    await vscode.env.clipboard.readText();

                if (!text.trim()) {
                    vscode.window.showWarningMessage(
                        'FileForge: Clipboard is empty.'
                    );
                    return;
                }

                const parsed =
                    parseAnyTree(text);

                if (!parsed) {
                    const action =
                        await vscode.window.showErrorMessage(
                            'FileForge: The clipboard content is not a supported file structure.',
                            'Try Again'
                        );

                    if (action === 'Try Again') {
                        await vscode.commands.executeCommand(
                            'fileforge.importStructure'
                        );
                    }

                    return;
                }

                const validation =
                    validateTree(parsed);

                if (!validation.valid) {
                    const errorSummary =
                        validation.errors.length === 1
                            ? validation.errors[0]
                            : `${validation.errors.length} validation errors found.`;

                    vscode.window.showErrorMessage(
                        `FileForge: Invalid file structure. ${errorSummary}`
                    );

                    console.error(
                        '--- VALIDATION ERRORS ---'
                    );

                    console.error(
                        validation.errors.join('\n')
                    );

                    return;
                }

                const conflictMode =
                    await vscode.window.showQuickPick(
                        [
                            {
                                label:
                                    'Skip existing files',
                                description:
                                    'Keep existing files unchanged.',
                                mode: 'skip' as const
                            },
                            {
                                label:
                                    'Overwrite existing files',
                                description:
                                    'Replace existing files with empty files.',
                                mode: 'overwrite' as const
                            }
                        ],
                        {
                            placeHolder:
                                'How should FileForge handle existing files?'
                        }
                    );

                if (!conflictMode) {
                    vscode.window.showInformationMessage(
                        'FileForge: Import cancelled.'
                    );
                    return;
                }

                const preview =
                    await previewTree(parsed);

                const confirmed =
                    await showImportPreview(
                        context,
                        parsed,
                        preview,
                        conflictMode.mode
                    );

                if (!confirmed) {
                    vscode.window.showInformationMessage(
                        'FileForge: Import cancelled.'
                    );
                    return;
                }

                try {
                    const result =
                        await createTree(
                            parsed,
                            conflictMode.mode
                        );

                    const createdCount =
                        result.created.length;

                    const skippedCount =
                        result.skipped.length;

                    vscode.window.showInformationMessage(
                        `FileForge: Created ${createdCount} item(s). Skipped ${skippedCount} existing item(s).`
                    );

                    console.log(
                        '--- CREATED ---'
                    );

                    console.log(
                        result.created
                    );

                    console.log(
                        '--- SKIPPED ---'
                    );

                    console.log(
                        result.skipped
                    );
                } catch (error) {
                    const message =
                        error instanceof Error
                            ? error.message
                            : String(error);

                    vscode.window.showErrorMessage(
                        `FileForge: Failed to create structure. ${message}`
                    );

                    console.error(error);

                    return;
                }

                console.log(
                    '--- IMPORTED TREE ---'
                );

                console.log(
                    JSON.stringify(
                        parsed,
                        null,
                        2
                    )
                );
            }
        );

    context.subscriptions.push(
        scanCommand,
        copyCommand,
        copyJsonWithContentCommand,
        testParserCommand,
        importCommand
    );
}

export function deactivate() {}