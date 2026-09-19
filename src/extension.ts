import * as vscode from 'vscode';
import { scanWorkspace } from './tree/scanner';
import { serializeTree } from './tree/serializer';
import { filterTree } from './tree/filter';
import { parseTree } from './tree/parser';

export function activate(context: vscode.ExtensionContext) {

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

            console.log('--- IMPORTED TREE ---');
            console.log(JSON.stringify(parsed, null, 2));

            vscode.window.showInformationMessage(
                `FileForge: Parsed "${parsed.name}" successfully.`
            );
        }
    );

    context.subscriptions.push(
        scanCommand,
        copyCommand,
        testParserCommand,
        importCommand
    );
}

export function deactivate() {}