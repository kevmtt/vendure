import { AssetService, mergeConfig } from '@vendure/core';
import { createTestEnvironment } from '@vendure/testing';
import path from 'node:path';
import { Readable } from 'stream';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { initialData } from '../../../e2e-common/e2e-initial-data';
import { TEST_SETUP_TIMEOUT_MS, testConfig } from '../../../e2e-common/test-config';

describe('AssetService.createFromFileStream()', () => {
    const { server } = createTestEnvironment(
        mergeConfig(testConfig(), {
            assetOptions: {
                permittedFileTypes: ['image/*', '.txt', '.xml'],
            },
        }),
    );

    beforeAll(async () => {
        await server.init({
            initialData,
            productsCsvPath: path.join(__dirname, 'fixtures/e2e-products-full.csv'),
            customerCount: 1,
        });
    }, TEST_SETUP_TIMEOUT_MS);

    afterAll(async () => {
        await server.destroy();
    });

    // https://github.com/vendurehq/vendure/issues/4651
    it('should create an asset from a file stream without a RequestContext', async () => {
        const assetService = server.app.get(AssetService);

        const stream = new Readable({ encoding: 'utf-8' });
        stream.push('test file content');
        stream.push(null);

        const result = await assetService.createFromFileStream(stream, 'test-file.txt');

        expect(result).toBeDefined();
        expect('id' in result).toBe(true);
        if ('id' in result) {
            expect(result.name).toBe('test-file.txt');
        }
    });
});
