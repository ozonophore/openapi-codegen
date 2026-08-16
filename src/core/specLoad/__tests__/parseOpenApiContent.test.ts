import assert from 'node:assert';
import { describe, test } from 'node:test';

import { parseOpenApiContent } from '../parseOpenApiContent';

describe('@unit: parseOpenApiContent', () => {
    test('parses JSON object content', async () => {
        const content = JSON.stringify({
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.0.0' },
            paths: {},
        });

        const parsed = (await parseOpenApiContent(content, 'spec.json')) as {
            openapi: string;
            info: { title: string };
        };

        assert.strictEqual(parsed.openapi, '3.0.0');
        assert.strictEqual(parsed.info.title, 'Test');
    });

    test('parses YAML content via temp file', async () => {
        const content = `
openapi: "3.0.0"
info:
  title: Yaml Spec
  version: "1.0.0"
paths: {}
`;

        const parsed = (await parseOpenApiContent(content, 'api.yaml')) as {
            openapi: string;
            info: { title: string };
        };

        assert.strictEqual(parsed.openapi, '3.0.0');
        assert.strictEqual(parsed.info.title, 'Yaml Spec');
    });

    test('throws on empty content with sourcePath', async () => {
        await assert.rejects(
            () => parseOpenApiContent('   \n', 'HEAD~1:openapi.yaml'),
            (err: unknown) => {
                assert.ok(err instanceof Error);
                assert.match(err.message, /Specification content is empty: HEAD~1:openapi\.yaml/);
                return true;
            }
        );
    });
});
