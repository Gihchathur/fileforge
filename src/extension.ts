import * as vscode from 'vscode';
import { scanWorkspace } from './tree/scanner';
import { serializeTree } from './tree/serializer';
import { filterTree } from './tree/filter';
import { parseTree } from './tree/parser';
import { validateTree } from './tree/validator';
import { createTree } from './tree/creator';
import { previewTree } from './tree/preview';
import { showImportPreview } from './preview/importPreview';
import { FileForgeViewProvider } from './sidebar/fileforgeView';

export function activate(context: vscode.ExtensionContext) {

    const fileForgeProvider =
        new FileForgeViewProvider();

    const fileForgeView =
        vscode.window.registerTreeDataProvider(
            'fileforge.mainView',
            fileForgeProvider
        );

    const scanCommand = vscode.commands.registerCommand(
        'fileforge.scanWorkspace',
        async () => {
            const tree = await scanWorkspace();

            if (!tree) {
                vscode.window.showWarningMessage(
                    'FileForge: No workspace is open.'
                );
                return;
            }

            const filteredTree = filterTree(tree);
            const output = serializeTree(filteredTree);

            console.log(output);

            vscode.window.showInformationMessage(
                `FileForge scanned "${tree.name}".`
            );
        }
    );

    const copyCommand = vscode.commands.registerCommand(
        'fileforge.copyStructure',
        async () => {
            const tree = await scanWorkspace();

            if (!tree) {
                vscode.window.showWarningMessage(
                    'FileForge: No workspace is open.'
                );
                return;
            }

            const filteredTree = filterTree(tree);
            const output = serializeTree(filteredTree);

            await vscode.env.clipboard.writeText(output);

            vscode.window.showInformationMessage(
                'FileForge: File structure copied to clipboard.'
            );
        }
    );

    const testParserCommand = vscode.commands.registerCommand(
        'fileforge.testParser',
        async () => {
            const tree = await scanWorkspace();

            if (!tree) {
                vscode.window.showWarningMessage(
                    'FileForge: No workspace is open.'
                );
                return;
            }

            const filteredTree = filterTree(tree);
            const serialized = serializeTree(filteredTree);

            console.log('--- SERIALIZED TREE ---');
            console.log(serialized);

            const parsed = parseTree(serialized);

            console.log('--- PARSED TREE ---');
            console.log(JSON.stringify(parsed, null, 2));

            vscode.window.showInformationMessage(
                'FileForge: Parser test completed.'
            );
        }
    );

    const importCommand = vscode.commands.registerCommand(
        'fileforge.importStructure',
        async () => {
            const text = await vscode.env.clipboard.readText();

            if (!text.trim()) {
                vscode.window.showWarningMessage(
                    'FileForge: Clipboard is empty.'
                );

                return;
            }

            const parsed = parseTree(text);

            if (!parsed) {
                vscode.window.showErrorMessage(
                    'FileForge: Could not parse the clipboard content.'
                );

                return;
            }

            const validation = validateTree(parsed);

            if (!validation.valid) {
                vscode.window.showErrorMessage(
                    `FileForge: Invalid file structure. ${validation.errors[0]}`
                );

                console.error(
                    '--- VALIDATION ERRORS ---'
                );

                console.error(
                    validation.errors.join('\n')
                );

                return;
            }

            const preview = await previewTree(parsed);

            const confirmed = await showImportPreview(
                context,
                parsed,
                preview
            );

            if (!confirmed) {
                vscode.window.showInformationMessage(
                    'FileForge: Import cancelled.'
                );

                return;
            }

            try {
                const result = await createTree(parsed);

                const createdCount = result.created.length;
                const skippedCount = result.skipped.length;

                vscode.window.showInformationMessage(
                    `FileForge: Created ${createdCount} item(s). Skipped ${skippedCount} existing item(s).`
                );

                console.log('--- CREATED ---');
                console.log(result.created);

                console.log('--- SKIPPED ---');
                console.log(result.skipped);
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

            console.log('--- IMPORTED TREE ---');
            console.log(JSON.stringify(parsed, null, 2));
        }
    );

    context.subscriptions.push(
        scanCommand,
        copyCommand,
        testParserCommand,
        importCommand,
        fileForgeView
    );
}

export function deactivate() {}