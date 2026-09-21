import * as assert from 'assert';
import { describe, it } from 'mocha';

import { isBinaryContent } from '../tree/binaryDetector';

describe('Binary Content Detector', () => {
    it(
        'should identify binary content',
        () => {
            const binaryData =
                new Uint8Array([
                    0,
                    120,
                    34,
                    10
                ]);

            assert.strictEqual(
                isBinaryContent(binaryData),
                true
            );
        }
    );

    it(
        'should identify normal text as non-binary',
        () => {
            const text =
                'Hello from FileForge!';

            const data =
                new TextEncoder().encode(
                    text
                );

            assert.strictEqual(
                isBinaryContent(data),
                false
            );
        }
    );

    it(
        'should treat empty files as non-binary',
        () => {
            const data =
                new Uint8Array([]);

            assert.strictEqual(
                isBinaryContent(data),
                false
            );
        }
    );
});