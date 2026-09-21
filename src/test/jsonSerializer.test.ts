import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { describe, it } from 'mocha';

import { serializeTreeWithContent } from '../tree/jsonSerializer';

describe('JSON Tree Serializer', () => {
    it(
        'should serialize files with their content',
        async function () {
            this.timeout(10000);

            const workspaceFolder =
                vscode.workspace.workspaceFolders?.[0];

            assert.ok(workspaceFolder);

            const testDirectory =
                path.join(
                    workspaceFolder.uri.fsPath,
                    'fileforge-test'
                );

            const testFile =
                path.join(
                    testDirectory,
                    'app.ts'
                );

            fs.mkdirSync(
                testDirectory,
                { recursive: true }
            );

            fs.writeFileSync(
                testFile,
                "console.log('Hello');"
            );

            const tree = {
                name: 'fileforge-test',
                type: 'directory' as const,
                children: [
                    {
                        name: 'app.ts',
                        type: 'file' as const
                    }
                ]
            };

            try {
                const json =
                    await serializeTreeWithContent(
                        tree,
                        vscode.Uri.file(
                            testDirectory
                        )
                    );

                const parsed =
                    JSON.parse(json);

                assert.strictEqual(
                    parsed.name,
                    'fileforge-test'
                );

                assert.strictEqual(
                    parsed.children[0].name,
                    'app.ts'
                );

                assert.strictEqual(
                    parsed.children[0].content,
                    "console.log('Hello');"
                );
            } finally {
                fs.rmSync(
                    testDirectory,
                    {
                        recursive: true,
                        force: true
                    }
                );
            }
        }
    );

    it(
        'should not export binary file content',
        async function () {
            this.timeout(10000);

            const workspaceFolder =
                vscode.workspace.workspaceFolders?.[0];

            assert.ok(workspaceFolder);

            const testDirectory =
                path.join(
                    workspaceFolder.uri.fsPath,
                    'fileforge-test'
                );

            const testFile =
                path.join(
                    testDirectory,
                    'binary.bin'
                );

            fs.mkdirSync(
                testDirectory,
                { recursive: true }
            );

            fs.writeFileSync(
                testFile,
                Buffer.from([
                    0,
                    255,
                    12,
                    34,
                    56,
                    78
                ])
            );

            const tree = {
                name: 'fileforge-test',
                type: 'directory' as const,
                children: [
                    {
                        name: 'binary.bin',
                        type: 'file' as const
                    }
                ]
            };

            try {
                const json =
                    await serializeTreeWithContent(
                        tree,
                        vscode.Uri.file(
                            testDirectory
                        )
                    );

                const parsed =
                    JSON.parse(json);

                assert.strictEqual(
                    parsed.children[0].name,
                    'binary.bin'
                );

                assert.strictEqual(
                    parsed.children[0].content,
                    undefined
                );

                assert.strictEqual(
                    parsed.children[0].contentStatus,
                    'binary'
                );
            } finally {
                fs.rmSync(
                    testDirectory,
                    {
                        recursive: true,
                        force: true
                    }
                );
            }
        }
    );

    it(
        'should not export content for files larger than the configured limit',
        async function () {
            this.timeout(10000);

            const workspaceFolder =
                vscode.workspace.workspaceFolders?.[0];

            assert.ok(workspaceFolder);

            const configuration =
                vscode.workspace.getConfiguration(
                    'fileforge'
                );

            const original =
                configuration.get<number>(
                    'maxContentFileSize'
                );

            const testDirectory =
                path.join(
                    workspaceFolder.uri.fsPath,
                    'fileforge-test'
                );

            const testFile =
                path.join(
                    testDirectory,
                    'large.txt'
                );

            fs.mkdirSync(
                testDirectory,
                { recursive: true }
            );

            fs.writeFileSync(
                testFile,
                'This file is larger than the configured limit.'
            );

            try {
                await configuration.update(
                    'maxContentFileSize',
                    10,
                    vscode.ConfigurationTarget.Workspace
                );

                const tree = {
                    name: 'fileforge-test',
                    type: 'directory' as const,
                    children: [
                        {
                            name: 'large.txt',
                            type: 'file' as const
                        }
                    ]
                };

                const json =
                    await serializeTreeWithContent(
                        tree,
                        vscode.Uri.file(
                            testDirectory
                        )
                    );

                const parsed =
                    JSON.parse(json);

                assert.strictEqual(
                    parsed.children[0].content,
                    undefined
                );

                assert.strictEqual(
                    parsed.children[0].contentStatus,
                    'too-large'
                );
            } finally {
                await configuration.update(
                    'maxContentFileSize',
                    original,
                    vscode.ConfigurationTarget.Workspace
                );

                fs.rmSync(
                    testDirectory,
                    {
                        recursive: true,
                        force: true
                    }
                );
            }
        }
    );

    it(
        'should preserve file content through JSON export and parse',
        async function () {
            this.timeout(10000);

            const workspaceFolder =
                vscode.workspace.workspaceFolders?.[0];

            assert.ok(workspaceFolder);

            const testDirectory =
                path.join(
                    workspaceFolder.uri.fsPath,
                    'fileforge-test'
                );

            const testFile =
                path.join(
                    testDirectory,
                    'app.ts'
                );

            fs.mkdirSync(
                testDirectory,
                {
                    recursive: true
                }
            );

            fs.writeFileSync(
                testFile,
                "console.log('Round trip');"
            );

            const tree = {
                name: 'fileforge-test',
                type: 'directory' as const,
                children: [
                    {
                        name: 'app.ts',
                        type: 'file' as const
                    }
                ]
            };

            try {
                const json =
                    await serializeTreeWithContent(
                        tree,
                        vscode.Uri.file(
                            testDirectory
                        )
                    );

                const parsedJson =
                    JSON.parse(json);

                assert.strictEqual(
                    parsedJson.children[0].content,
                    "console.log('Round trip');"
                );

                assert.strictEqual(
                    parsedJson.children[0]
                        .contentStatus,
                    'available'
                );
            } finally {
                fs.rmSync(
                    testDirectory,
                    {
                        recursive: true,
                        force: true
                    }
                );
            }
        }
    );
});