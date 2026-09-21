import * as assert from 'assert';
import { describe, it } from 'mocha';

import { summarizeContent } from '../tree/contentSummary';

describe('Content Summary', () => {
    it(
        'should summarize all content statuses',
        () => {
            const tree = {
                name: 'project',
                type: 'directory' as const,
                children: [
                    {
                        name: 'app.ts',
                        type: 'file' as const,
                        content: 'console.log("Hello");',
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
                    }
                ]
            };

            const summary =
                summarizeContent(tree);

            assert.strictEqual(
                summary.available,
                1
            );

            assert.strictEqual(
                summary.redacted,
                1
            );

            assert.strictEqual(
                summary.binary,
                1
            );

            assert.strictEqual(
                summary.tooLarge,
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
                            'console.log("Hello");'
                    }
                ]
            };

            const summary =
                summarizeContent(tree);

            assert.strictEqual(
                summary.available,
                1
            );

            assert.strictEqual(
                summary.redacted,
                0
            );

            assert.strictEqual(
                summary.binary,
                0
            );

            assert.strictEqual(
                summary.tooLarge,
                0
            );
        }
    );
});