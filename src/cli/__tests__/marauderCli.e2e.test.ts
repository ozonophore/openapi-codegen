import assert from 'node:assert';
import { execSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import path from 'node:path';
import { afterEach, before, beforeEach, describe, test, type TestContext } from 'node:test';

import { installSilenceLoggers } from '../../test/helpers/silenceLoggers';

const repoRoot = path.join(__dirname, '..', '..', '..');
const cliPath = path.join(repoRoot, 'dist/cli/index.js');
const lomSpec = path.join(repoRoot, 'test/spec/lom/lom_api.yaml');

function createTempDir(t: TestContext, prefix: string): string {
    const generatedRoot = path.join(__dirname, 'generated');
    mkdirSync(generatedRoot, { recursive: true });
    const tempDir = mkdtempSync(path.join(generatedRoot, prefix));
    t.after(() => {
        rmSync(tempDir, { recursive: true, force: true });
    });
    return tempDir;
}

function runCli(args: string[], cwd: string) {
    return spawnSync(process.execPath, [cliPath, ...args], {
        cwd,
        encoding: 'utf8',
        env: {
            ...process.env,
            NO_UPDATE_NOTIFIER: '1',
        },
    });
}

describe('marauder CLI e2e', () => {
    let restoreLoggers: (() => void) | undefined;

    before(() => {
        if (!existsSync(cliPath)) {
            execSync('npm run build', { cwd: repoRoot, stdio: 'pipe' });
        }
        assert.strictEqual(existsSync(cliPath), true, 'dist/cli/index.js must exist for e2e tests');
    });

    beforeEach(() => {
        restoreLoggers = installSilenceLoggers();
    });

    afterEach(() => {
        restoreLoggers?.();
    });

    test('E2E: generate accepts dot-notation --auto-select.strict via real argv', t => {
        const tempDir = createTempDir(t, 'marauder-e2e-dot-');
        const outputDir = path.join(tempDir, 'generated');

        const result = runCli(['generate', '-i', lomSpec, '-o', outputDir, '--auto-select.strict'], tempDir);

        assert.strictEqual(result.status, 0, result.stderr || result.stdout);
        assert.strictEqual(existsSync(path.join(outputDir, 'index.ts')), true);
    });

    test('E2E: generate accepts inline boolean --auto-select=true via real argv', t => {
        const tempDir = createTempDir(t, 'marauder-e2e-inline-');
        const outputDir = path.join(tempDir, 'generated');

        const result = runCli(['generate', '-i', lomSpec, '-o', outputDir, '--auto-select=true'], tempDir);

        assert.strictEqual(result.status, 0, result.stderr || result.stdout);
        assert.strictEqual(existsSync(path.join(outputDir, 'index.ts')), true);
    });
});
