import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { describe, it } from 'mocha';

import { createTree } from '../tree/creator';
import { serializeTreeWithContent } from '../tree/jsonSerializer';
import { parseAnyTree } from '../tree/parseAnyTree';
import { validateTree } from '../tree/validator';

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
                        content:
                            'Hello from FileForge!',
                        contentStatus:
                            'available' as const
                    }
                ]
            };

            fs.rmSync(
                testDirectory,
                {
                    recursive: true,
                    force: true
                }
            );

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

                assert.ok(
                    result.filesWithContent.includes(
                        'fileforge-test/hello.txt'
                    )
                );

                assert.strictEqual(
                    result.filesWithoutContent.length,
                    0
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
                                    "console.log('Hello FileForge');",
                                contentStatus:
                                    'available' as const
                            }
                        ]
                    },
                    {
                        name: 'config.json',
                        type: 'file' as const,
                        content:
                            '{"enabled":true}',
                        contentStatus:
                            'available' as const
                    }
                ]
            };

            fs.rmSync(
                testDirectory,
                {
                    recursive: true,
                    force: true
                }
            );

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
                    result.filesWithContent.includes(
                        'fileforge-test/src/app.ts'
                    )
                );

                assert.ok(
                    result.filesWithContent.includes(
                        'fileforge-test/config.json'
                    )
                );

                assert.strictEqual(
                    result.filesWithContent.length,
                    2
                );

                assert.strictEqual(
                    result.filesWithoutContent.length,
                    0
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

    it(
        'should create an empty file for redacted content',
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
                    'secret.txt'
                );

            fs.rmSync(
                testDirectory,
                {
                    recursive: true,
                    force: true
                }
            );

            try {
                const tree = {
                    name: 'fileforge-test',
                    type: 'directory' as const,
                    children: [
                        {
                            name: 'secret.txt',
                            type: 'file' as const,
                            contentStatus:
                                'redacted' as const
                        }
                    ]
                };

                const result =
                    await createTree(
                        tree,
                        'skip'
                    );

                assert.ok(
                    fs.existsSync(testFile)
                );

                assert.strictEqual(
                    fs.readFileSync(
                        testFile,
                        'utf8'
                    ),
                    ''
                );

                assert.ok(
                    result.filesWithoutContent.includes(
                        'fileforge-test/secret.txt'
                    )
                );

                assert.strictEqual(
                    result.filesWithContent.length,
                    0
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
        'should create an empty file for binary content',
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
                    'image.bin'
                );

            fs.rmSync(
                testDirectory,
                {
                    recursive: true,
                    force: true
                }
            );

            try {
                const tree = {
                    name: 'fileforge-test',
                    type: 'directory' as const,
                    children: [
                        {
                            name: 'image.bin',
                            type: 'file' as const,
                            contentStatus:
                                'binary' as const
                        }
                    ]
                };

                const result =
                    await createTree(
                        tree,
                        'skip'
                    );

                assert.ok(
                    fs.existsSync(testFile)
                );

                assert.strictEqual(
                    fs.readFileSync(
                        testFile,
                        'utf8'
                    ),
                    ''
                );

                assert.ok(
                    result.filesWithoutContent.includes(
                        'fileforge-test/image.bin'
                    )
                );

                assert.strictEqual(
                    result.filesWithContent.length,
                    0
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
        'should create an empty file for content that is too large',
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
                    'large.txt'
                );

            fs.rmSync(
                testDirectory,
                {
                    recursive: true,
                    force: true
                }
            );

            try {
                const tree = {
                    name: 'fileforge-test',
                    type: 'directory' as const,
                    children: [
                        {
                            name: 'large.txt',
                            type: 'file' as const,
                            contentStatus:
                                'too-large' as const
                        }
                    ]
                };

                const result =
                    await createTree(
                        tree,
                        'skip'
                    );

                assert.ok(
                    fs.existsSync(testFile)
                );

                assert.strictEqual(
                    fs.readFileSync(
                        testFile,
                        'utf8'
                    ),
                    ''
                );

                assert.ok(
                    result.filesWithoutContent.includes(
                        'fileforge-test/large.txt'
                    )
                );

                assert.strictEqual(
                    result.filesWithContent.length,
                    0
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
        'should export, parse, validate and recreate a file with content',
        async function () {
            this.timeout(10000);

            const workspaceFolder =
                vscode.workspace.workspaceFolders?.[0];

            assert.ok(workspaceFolder);

            const sourceDirectory =
                path.join(
                    workspaceFolder.uri.fsPath,
                    'fileforge-source'
                );

            const targetDirectory =
                path.join(
                    workspaceFolder.uri.fsPath,
                    'fileforge-target'
                );

            const sourceFile =
                path.join(
                    sourceDirectory,
                    'app.ts'
                );

            const targetFile =
                path.join(
                    targetDirectory,
                    'app.ts'
                );

            fs.rmSync(
                sourceDirectory,
                {
                    recursive: true,
                    force: true
                }
            );

            fs.rmSync(
                targetDirectory,
                {
                    recursive: true,
                    force: true
                }
            );

            fs.mkdirSync(
                sourceDirectory,
                {
                    recursive: true
                }
            );

            fs.writeFileSync(
                sourceFile,
                "console.log('FileForge round trip');"
            );

            const sourceTree = {
                name: 'fileforge-source',
                type: 'directory' as const,
                children: [
                    {
                        name: 'app.ts',
                        type: 'file' as const
                    }
                ]
            };

            try {
                // 1. Export
                const json =
                    await serializeTreeWithContent(
                        sourceTree,
                        vscode.Uri.file(
                            sourceDirectory
                        )
                    );

                // 2. Parse
                const parsed =
                    parseAnyTree(json);

                assert.ok(parsed);

                // 3. Validate
                const validation =
                    validateTree(parsed);

                assert.strictEqual(
                    validation.valid,
                    true
                );

                // 4. Change root name so we create
                // the structure in a separate directory.
                parsed.name =
                    'fileforge-target';

                // 5. Create
                const result =
                    await createTree(
                        parsed,
                        'skip'
                    );

                // 6. Verify the file exists
                assert.ok(
                    fs.existsSync(targetFile)
                );

                // 7. Verify the content
                assert.strictEqual(
                    fs.readFileSync(
                        targetFile,
                        'utf8'
                    ),
                    "console.log('FileForge round trip');"
                );

                // 8. Verify it was reported as created
                assert.ok(
                    result.created.includes(
                        'fileforge-target/app.ts'
                    )
                );

                assert.ok(
                    result.filesWithContent.includes(
                        'fileforge-target/app.ts'
                    )
                );

                assert.strictEqual(
                    result.filesWithoutContent.length,
                    0
                );
            } finally {
                fs.rmSync(
                    sourceDirectory,
                    {
                        recursive: true,
                        force: true
                    }
                );

                fs.rmSync(
                    targetDirectory,
                    {
                        recursive: true,
                        force: true
                    }
                );
            }
        }
    );
});