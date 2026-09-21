import * as assert from 'assert';
import * as vscode from 'vscode';
import { describe, it } from 'mocha';

import { isSensitiveFile } from '../tree/contentFilter';

describe('Content Filter', () => {
    it(
        'should identify default sensitive files',
        () => {
            assert.strictEqual(
                isSensitiveFile('.env'),
                true
            );

            assert.strictEqual(
                isSensitiveFile('.env.local'),
                true
            );

            assert.strictEqual(
                isSensitiveFile('credentials.json'),
                true
            );

            assert.strictEqual(
                isSensitiveFile('id_rsa'),
                true
            );
        }
    );

    it(
        'should allow normal source files',
        () => {
            assert.strictEqual(
                isSensitiveFile('app.ts'),
                false
            );

            assert.strictEqual(
                isSensitiveFile('package.json'),
                false
            );

            assert.strictEqual(
                isSensitiveFile('README.md'),
                false
            );
        }
    );

    it(
        'should handle file names case-insensitively',
        () => {
            assert.strictEqual(
                isSensitiveFile('.ENV'),
                true
            );

            assert.strictEqual(
                isSensitiveFile('Credentials.JSON'),
                true
            );
        }
    );

    it(
        'should use configured sensitive files',
        async function () {
            this.timeout(10000);

            const configuration =
                vscode.workspace.getConfiguration(
                    'fileforge'
                );

            const original =
                configuration.get<string[]>(
                    'sensitiveFiles'
                );

            try {
                await configuration.update(
                    'sensitiveFiles',
                    [
                        'custom.secret'
                    ],
                    vscode.ConfigurationTarget.Workspace
                );

                assert.strictEqual(
                    isSensitiveFile(
                        'custom.secret'
                    ),
                    true
                );

                assert.strictEqual(
                    isSensitiveFile(
                        'app.ts'
                    ),
                    false
                );
            } finally {
                await configuration.update(
                    'sensitiveFiles',
                    original,
                    vscode.ConfigurationTarget.Workspace
                );
            }
        }
    );
});