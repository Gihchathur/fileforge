import * as assert from 'assert';
import { describe, it } from 'mocha';

import {
    countFilesWithContent,
    countFilesWithStatus
} from '../preview/importPreview';

describe('Import Preview', () => {
    it(
        'should count only files with available content',
        () => {
            const tree = {
                name: 'project',
                type: 'directory' as const,
                children: [
                    {
                        name: 'app.ts',
                        type: 'file' as const,
                        content:
                            "console.log('Hello');",
                        contentStatus:
                            'available' as const
                    },
                    {
                        name: '.env',
                        type: 'file' as const,
                        contentStatus:
                            'redacted' as const
                    },
                    {
                        name: 'image.png',
                        type: 'file' as const,
                        contentStatus:
                            'binary' as const
                    },
                    {
                        name: 'large.sql',
                        type: 'file' as const,
                        contentStatus:
                            'too-large' as const
                    },
                    {
                        name: 'README.md',
                        type: 'file' as const
                    }
                ]
            };

            assert.strictEqual(
                countFilesWithContent(tree),
                1
            );
        }
    );

    it(
        'should support legacy files without contentStatus',
        () => {
            const tree = {
                name: 'project',
                type: 'directory' as const,
                children: [
                    {
                        name: 'app.ts',
                        type: 'file' as const,
                        content:
                            "console.log('Hello');"
                    },
                    {
                        name: 'README.md',
                        type: 'file' as const
                    }
                ]
            };

            assert.strictEqual(
                countFilesWithContent(tree),
                1
            );
        }
    );

    it(
        'should count redacted files',
        () => {
            const tree = {
                name: 'project',
                type: 'directory' as const,
                children: [
                    {
                        name: '.env',
                        type: 'file' as const,
                        contentStatus:
                            'redacted' as const
                    },
                    {
                        name: 'credentials.json',
                        type: 'file' as const,
                        contentStatus:
                            'redacted' as const
                    },
                    {
                        name: 'app.ts',
                        type: 'file' as const,
                        contentStatus:
                            'available' as const
                    }
                ]
            };

            assert.strictEqual(
                countFilesWithStatus(
                    tree,
                    'redacted'
                ),
                2
            );
        }
    );

    it(
        'should count binary files',
        () => {
            const tree = {
                name: 'project',
                type: 'directory' as const,
                children: [
                    {
                        name: 'image.png',
                        type: 'file' as const,
                        contentStatus:
                            'binary' as const
                    },
                    {
                        name: 'logo.jpg',
                        type: 'file' as const,
                        contentStatus:
                            'binary' as const
                    },
                    {
                        name: 'app.ts',
                        type: 'file' as const,
                        contentStatus:
                            'available' as const
                    }
                ]
            };

            assert.strictEqual(
                countFilesWithStatus(
                    tree,
                    'binary'
                ),
                2
            );
        }
    );

    it(
        'should count files that exceed the content limit',
        () => {
            const tree = {
                name: 'project',
                type: 'directory' as const,
                children: [
                    {
                        name: 'database.sql',
                        type: 'file' as const,
                        contentStatus:
                            'too-large' as const
                    },
                    {
                        name: 'backup.sql',
                        type: 'file' as const,
                        contentStatus:
                            'too-large' as const
                    },
                    {
                        name: 'app.ts',
                        type: 'file' as const,
                        contentStatus:
                            'available' as const
                    }
                ]
            };

            assert.strictEqual(
                countFilesWithStatus(
                    tree,
                    'too-large'
                ),
                2
            );
        }
    );
});