import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { describe, it } from 'mocha';

import { createTree } from '../tree/creator';

describe('Tree Creator', () => {
    it(
        'should skip existing files',
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
                    'existing.txt'
                );

            fs.mkdirSync(
                testDirectory,
                { recursive: true }
            );

            fs.writeFileSync(
                testFile,
                'original content'
            );

            const tree = {
                name: 'fileforge-test',
                type: 'directory' as const,
                children: [
                    {
                        name: 'existing.txt',
                        type: 'file' as const
                    }
                ]
            };

            try {
                const result =
                    await createTree(
                        tree,
                        'skip'
                    );

                assert.ok(
                    result.skipped.includes(
                        'fileforge-test/existing.txt'
                    )
                );

                assert.strictEqual(
                    fs.readFileSync(
                        testFile,
                        'utf8'
                    ),
                    'original content'
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
        'should overwrite existing files',
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
                    'existing.txt'
                );

            fs.mkdirSync(
                testDirectory,
                { recursive: true }
            );

            fs.writeFileSync(
                testFile,
                'original content'
            );

            const tree = {
                name: 'fileforge-test',
                type: 'directory' as const,
                children: [
                    {
                        name: 'existing.txt',
                        type: 'file' as const
                    }
                ]
            };

            try {
                const result =
                    await createTree(
                        tree,
                        'overwrite'
                    );

                assert.ok(
                    result.skipped.includes(
                        'fileforge-test/existing.txt'
                    )
                );

                assert.strictEqual(
                    fs.readFileSync(
                        testFile,
                        'utf8'
                    ),
                    'original content'
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
        'should create a new file with imported content',
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
                    'hello.txt'
                );

            const tree = {
                name: 'fileforge-test',
                type: 'directory' as const,
                children: [
                    {
                        name: 'hello.txt',
                        type: 'file' as const,
                        content: 'Hello from FileForge!'
                    }
                ]
            };

            try {
                const result =
                    await createTree(
                        tree,
                        'skip'
                    );

                assert.ok(
                    result.created.includes(
                        'fileforge-test/hello.txt'
                    )
                );

                assert.strictEqual(
                    fs.readFileSync(
                        testFile,
                        'utf8'
                    ),
                    'Hello from FileForge!'
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
        'should create directories and files with imported content',
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

            const srcDirectory =
                path.join(
                    testDirectory,
                    'src'
                );

            const appFile =
                path.join(
                    srcDirectory,
                    'app.ts'
                );

            const configFile =
                path.join(
                    testDirectory,
                    'config.json'
                );

            const tree = {
                name: 'fileforge-test',
                type: 'directory' as const,
                children: [
                    {
                        name: 'src',
                        type: 'directory' as const,
                        children: [
                            {
                                name: 'app.ts',
                                type: 'file' as const,
                                content:
                                    "console.log('Hello FileForge');"
                            }
                        ]
                    },
                    {
                        name: 'config.json',
                        type: 'file' as const,
                        content:
                            '{"enabled":true}'
                    }
                ]
            };

            try {
                const result =
                    await createTree(
                        tree,
                        'skip'
                    );

                assert.ok(
                    result.created.includes(
                        'fileforge-test'
                    )
                );

                assert.ok(
                    result.created.includes(
                        'fileforge-test/src'
                    )
                );

                assert.ok(
                    result.created.includes(
                        'fileforge-test/src/app.ts'
                    )
                );

                assert.ok(
                    result.created.includes(
                        'fileforge-test/config.json'
                    )
                );

                assert.strictEqual(
                    fs.readFileSync(
                        appFile,
                        'utf8'
                    ),
                    "console.log('Hello FileForge');"
                );

                assert.strictEqual(
                    fs.readFileSync(
                        configFile,
                        'utf8'
                    ),
                    '{"enabled":true}'
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