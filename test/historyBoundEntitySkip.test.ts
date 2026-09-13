import assert from 'node:assert/strict';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, test } from 'node:test';

import { generate, HttpClient } from '../src';
import { installSilenceLoggers } from '../src/test/helpers/silenceLoggers';
import { createTempDir } from '../src/test/helpers/createTempDir';

const specDir = path.join(__dirname, 'spec');

function writeRemovedPropertyReport(reportPath: string, propertyName: string): void {
    writeFileSync(
        reportPath,
        JSON.stringify({
            diff: {
                all: [
                    {
                        action: 'removed',
                        path: `$.components.schemas.ModelWithString.properties.${propertyName}`,
                        severity: 'warning',
                    },
                ],
            },
        }),
        'utf8'
    );
}

function findGeneratedFile(outputDir: string, fileName: string): string {
    const files = readdirSync(outputDir, { recursive: true, encoding: 'utf8' }).map(file => String(file).replace(/\\/g, '/'));
    const relative = files.find(file => file === fileName || file.endsWith(`/${fileName}`));
    assert.ok(relative, `expected generated file ${fileName} under ${outputDir}`);
    return path.join(outputDir, relative);
}

describe('@unit: history-bound entity skip', () => {
    let restoreLoggers: (() => void) | undefined;

    beforeEach(() => {
        restoreLoggers = installSilenceLoggers();
    });

    afterEach(() => {
        restoreLoggers?.();
        restoreLoggers = undefined;
    });

    test('editing Diff report after a cached history run applies the report and does not entity-skip', async t => {
        const tmpDir = createTempDir(t, 'history-bound-skip-');
        const outputDir = path.join(tmpDir, 'out');
        const cachePath = path.join(tmpDir, 'cache.json');
        const reportPath = path.join(tmpDir, 'diff-report.json');
        const input = path.join(specDir, 'v3.json');

        writeRemovedPropertyReport(reportPath, 'firstGhostField');

        await generate({
            input,
            output: outputDir,
            httpClient: HttpClient.FETCH,
            cache: true,
            cacheStrategy: 'entity',
            cachePath,
            useHistory: true,
            diffReport: reportPath,
        } as any);

        const modelFile = findGeneratedFile(outputDir, 'ModelWithString.ts');
        const afterFirst = readFileSync(modelFile, 'utf8');
        assert.match(afterFirst, /firstGhostField\?: unknown/);

        writeRemovedPropertyReport(reportPath, 'secondGhostField');

        await generate({
            input,
            output: outputDir,
            httpClient: HttpClient.FETCH,
            cache: true,
            cacheStrategy: 'entity',
            cachePath,
            useHistory: true,
            diffReport: reportPath,
        } as any);

        const report = JSON.parse(readFileSync(path.join(outputDir, 'reports', 'latest.json'), 'utf8')) as {
            specs?: Array<{ entitySkipped?: boolean }>;
        };
        assert.equal(report.specs?.[0]?.entitySkipped, false);

        const afterSecond = readFileSync(modelFile, 'utf8');
        assert.match(afterSecond, /secondGhostField\?: unknown/);
        assert.doesNotMatch(afterSecond, /firstGhostField\?: unknown/);
    });
});
