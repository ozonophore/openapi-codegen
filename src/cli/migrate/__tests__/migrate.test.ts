import assert from 'node:assert';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, mock, test, type TestContext } from 'node:test';

import { installSilenceLoggers } from '../../../test/helpers/silenceLoggers';
import { migrate } from '../migrate';

function createTempDir(t: TestContext): string {
    const generatedRoot = path.join(__dirname, 'generated');
    mkdirSync(generatedRoot, { recursive: true });
    const tempDir = mkdtempSync(path.join(generatedRoot, 'migrate-cli-'));
    const previousCwd = process.cwd();
    process.chdir(tempDir);
    t.after(() => {
        process.chdir(previousCwd);
        rmSync(tempDir, { recursive: true, force: true });
    });
    return tempDir;
}

describe('@unit: migrate', () => {
    let restoreLoggers: (() => void) | undefined;

    beforeEach(() => {
        restoreLoggers = installSilenceLoggers();
    });

    afterEach(() => {
        restoreLoggers?.();
    });

    test('rollbackThreshold 10 appears in console output', async t => {
        createTempDir(t);

        const consoleOutput: string[] = [];
        const consoleLogMock = mock.method(console, 'log', (...args: unknown[]) => {
            consoleOutput.push(args.map(String).join(' '));
        });

        t.after(() => {
            consoleLogMock.mock.restore();
        });

        await migrate({
            fromClient: 'old-client',
            toClient: 'new-client',
            rollbackThreshold: 10,
            generateGuide: false,
        });

        const output = consoleOutput.join('\n');
        assert.match(output, /> 10%/);
    });

    test('diff report breaking count tunes migration plan', async t => {
        const tempDir = createTempDir(t);
        const reportPath = path.join(tempDir, 'semantic-report.json');
        const semanticReport = {
            schemaVersion: '1.1.0',
            summary: { breaking: 2, nonBreaking: 0, informational: 0 },
            recommendation: {
                semver: 'major',
                confidence: 'high',
                reason: 'Breaking changes detected.',
                reasons: ['HAS_BREAKING_CHANGES'],
            },
            governance: {
                summary: { errors: 0, warnings: 0, info: 0 },
                violations: [],
            },
            changes: [
                {
                    type: 'model.property.type.changed',
                    severity: 'breaking',
                    path: '#/components/schemas/User/properties/age',
                    message: 'type changed',
                    from: 'string',
                    to: 'integer',
                },
                {
                    type: 'model.property.removed',
                    severity: 'breaking',
                    path: '#/components/schemas/User/properties/first_name',
                    message: 'removed',
                    from: { type: 'string' },
                },
            ],
        };
        writeFileSync(reportPath, JSON.stringify(semanticReport), 'utf-8');

        const consoleOutput: string[] = [];
        const consoleLogMock = mock.method(console, 'log', (...args: unknown[]) => {
            consoleOutput.push(args.map(String).join(' '));
        });

        t.after(() => {
            consoleLogMock.mock.restore();
        });

        await migrate({
            fromClient: 'old-client',
            toClient: 'new-client',
            diffReport: reportPath,
            generateGuide: false,
        });

        const output = consoleOutput.join('\n');
        assert.match(output, /Breaking changes detected: 2/);
        assert.match(output, /Canary Phase 1\/5/);
        assert.match(output, /Canary Phase 5\/5/);
    });

    test('diff report rename miracles appear in migration guide', async t => {
        const tempDir = createTempDir(t);
        const reportPath = path.join(tempDir, 'semantic-report.json');
        const guidePath = path.join(tempDir, 'MIGRATION_GUIDE.md');
        const semanticReport = {
            schemaVersion: '1.1.0',
            summary: { breaking: 1, nonBreaking: 0, informational: 0 },
            recommendation: {
                semver: 'major',
                confidence: 'high',
                reason: 'Breaking changes detected.',
                reasons: ['HAS_BREAKING_CHANGES'],
            },
            governance: {
                summary: { errors: 0, warnings: 0, info: 0 },
                violations: [],
            },
            changes: [
                {
                    type: 'model.removed',
                    severity: 'breaking',
                    path: '#/components/schemas/OldUser',
                    message: 'removed',
                },
            ],
            miracles: [
                {
                    oldPath: '#/components/schemas/OldUser',
                    newPath: '#/components/schemas/User',
                    type: 'RENAME',
                    confidence: 0.9,
                    status: 'confirmed',
                },
            ],
        };
        writeFileSync(reportPath, JSON.stringify(semanticReport), 'utf-8');

        await migrate({
            fromClient: 'old-client',
            toClient: 'new-client',
            diffReport: reportPath,
            guidePath,
            generateGuide: true,
        });

        const guide = readFileSync(guidePath, 'utf-8');
        assert.match(guide, /Symbol Renames \(from analyze-diff\)/);
        assert.match(guide, /OldUser → User/);
        assert.match(guide, /analyze-usage/);
    });
});
