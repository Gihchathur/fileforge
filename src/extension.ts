import * as vscode from 'vscode';

import { scanWorkspace } from './tree/scanner';
import { serializeTree } from './tree/serializer';
import { serializeTreeWithContent } from './tree/jsonSerializer';
import { parseAnyTree } from './tree/parseAnyTree';
import { validateTree } from './tree/validator';
import { createTree } from './tree/creator';
import { previewTree } from './tree/preview';

import { showImportPreview } from './preview/importPreview';
import { showExportPreview } from './export/exportPreview';

import { getTreeStats } from './tree/treeStats';
import { summarizeContent } from './tree/contentSummary';

import { FileForgeViewProvider } from './sidebar/fileforgeView';

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

                const stats =
                    getTreeStats(tree);

                await showExportPreview({
                    title:
                        'Export File Structure',

                    content:
                        output,

                    language:
                        'plaintext',

                    root:
                        tree,

                    stats
                });
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

                    const stats =
                        getTreeStats(tree);

                    const parsedJson =
                        JSON.parse(json);

                    const contentSummary =
                        summarizeContent(parsedJson);

                    await showExportPreview({
                        title:
                            'Export JSON With Content',

                        content:
                            json,

                        language:
                            'json',

                        root:
                            tree,

                        stats,

                        contentSummary
                    });
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
                                    'Keep existing files',

                                description:
                                    'Existing files will not be modified.',

                                mode:
                                    'skip' as const
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
                        parsed,
                        preview
                    );

                if (!confirmed) {
                    vscode.window.showInformationMessage(
                        'FileForge: Import cancelled.'
                    );

                    return;
                }

                const finalConfirmation =
                    await vscode.window.showWarningMessage(
                        `FileForge will create ${preview.create.length} item(s). Existing files will remain unchanged.`,
                        {
                            modal: true
                        },
                        'Create'
                    );

                if (
                    finalConfirmation !==
                    'Create'
                ) {
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

                    const filesWithContentCount =
                        result.filesWithContent.length;

                    const filesWithoutContentCount =
                        result.filesWithoutContent.length;

                    vscode.window.showInformationMessage(
                        `FileForge: Created ${createdCount} item(s), including ${filesWithContentCount} file(s) with imported content. ${skippedCount} existing item(s) kept. ${filesWithoutContentCount} file(s) created without imported content.`
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
        importCommand
    );
}

export function deactivate() {}