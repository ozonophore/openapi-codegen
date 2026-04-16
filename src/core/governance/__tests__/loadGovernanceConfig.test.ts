import assert from 'node:assert';
import { mkdtempSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, test } from 'node:test';

import { loadGovernanceConfig } from '../loadGovernanceConfig';

function createTempDir(prefix: string): string {
    return mkdtempSync(path.join(os.tmpdir(), prefix));
}

describe('@unit: loadGovernanceConfig', () => {
    test('returns undefined when path is not provided', async () => {
        const config = await loadGovernanceConfig();
        assert.strictEqual(config, undefined);
    });

    test('loads valid governance config', async () => {
        const tempDir = createTempDir('openapi-governance-config-valid-');
        const configPath = path.join(tempDir, 'governance.json');

        writeFileSync(
            configPath,
            JSON.stringify({
                rules: {
                    NO_BREAKING_WITHOUT_FLAG: {
                        enabled: true,
                        severity: 'error',
                    },
                    REQUIRE_OPERATION_ID: {
                        allowList: [{ operation: '/users GET' }],
                    },
                },
            })
        );

        const config = await loadGovernanceConfig(configPath);
        assert.ok(config);
        assert.strictEqual(config?.rules?.NO_BREAKING_WITHOUT_FLAG?.severity, 'error');
        assert.strictEqual(config?.rules?.REQUIRE_OPERATION_ID?.allowList?.[0]?.operation, '/users GET');
    });

    test('throws with path details for invalid severity', async () => {
        const tempDir = createTempDir('openapi-governance-config-invalid-severity-');
        const configPath = path.join(tempDir, 'governance.json');

        writeFileSync(
            configPath,
            JSON.stringify({
                rules: {
                    NO_DEFAULT_WITHOUT_2XX: {
                        severity: 'fatal',
                    },
                },
            })
        );

        await assert.rejects(
            async () => loadGovernanceConfig(configPath),
            (error: unknown) => error instanceof Error && error.message.includes('rules.NO_DEFAULT_WITHOUT_2XX.severity')
        );
    });

    test('throws with path details for invalid allowList item', async () => {
        const tempDir = createTempDir('openapi-governance-config-invalid-allowlist-');
        const configPath = path.join(tempDir, 'governance.json');

        writeFileSync(
            configPath,
            JSON.stringify({
                rules: {
                    REQUIRE_OPERATION_ID: {
                        allowList: [{}],
                    },
                },
            })
        );

        await assert.rejects(
            async () => loadGovernanceConfig(configPath),
            (error: unknown) => error instanceof Error && error.message.includes('rules.REQUIRE_OPERATION_ID.allowList.[0]')
        );
    });
});
