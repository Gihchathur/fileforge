import * as assert from 'assert';
import * as vscode from 'vscode';
import { describe, it } from 'mocha';

import { scanWorkspace } from '../tree/scanner';

describe('Workspace Scanner', () => {
    it(
        'should exclude configured directories',
        async function () {
            this.timeout(15000);

            const configuration =
                vscode.workspace.getConfiguration(
                    'fileforge'
                );

            const original =
                configuration.get<string[]>(
                    'ignoreDirectories'
                );

            const updated = [
                ...(original ?? []),
                'temp'
            ];

            try {
                await configuration.update(
                    'ignoreDirectories',
                    updated,
                    vscode.ConfigurationTarget.Workspace
                );

                const tree =
                    await scanWorkspace();

                assert.ok(tree);

                const tempDirectory =
                    tree.children?.find(
                        node =>
                            node.name === 'temp'
                    );

                assert.strictEqual(
                    tempDirectory,
                    undefined
                );
            } finally {
                await configuration.update(
                    'ignoreDirectories',
                    original,
                    vscode.ConfigurationTarget.Workspace
                );
            }
        }
    );
});