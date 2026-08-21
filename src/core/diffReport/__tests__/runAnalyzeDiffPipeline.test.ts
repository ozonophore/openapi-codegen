import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';

import type { CommonOpenApi } from '../../types/shared/CommonOpenApi.model';
import { runAnalyzeDiffPipeline } from '../runAnalyzeDiffPipeline';

const oldSpec = {
    openapi: '3.0.0',
    info: { title: 'demo', version: '1.0.0' },
    paths: {
        '/users': {
            get: {
                operationId: 'listUsers',
                responses: { '200': { description: 'ok' } },
            },
        },
    },
} as unknown as CommonOpenApi;

const newSpecCompatible = {
    openapi: '3.0.0',
    info: { title: 'demo', version: '1.0.0' },
    paths: {
        '/users': {
            get: {
                operationId: 'listUsers',
                responses: { '200': { description: 'ok' } },
            },
        },
        '/pets': {
            get: {
                operationId: 'listPets',
                responses: { '200': { description: 'ok' } },
            },
        },
    },
} as unknown as CommonOpenApi;

const newSpecBreaking = {
    openapi: '3.0.0',
    info: { title: 'demo', version: '1.0.0' },
    paths: {},
} as unknown as CommonOpenApi;

describe('@unit: runAnalyzeDiffPipeline', () => {
    let tempDir: string;

    before(async () => {
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'analyze-diff-pipeline-'));
    });

    after(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    test('writes Unified report and returns ciFailed=false when ci is false', async () => {
        const reportPath = path.join(tempDir, 'ok.json');
        const result = await runAnalyzeDiffPipeline({
            oldSpec,
            newSpec: newSpecCompatible,
            base: 'compare-with:old',
            target: 'new',
            reportPath,
            plugins: [],
            ignoreRules: [],
            allowBreaking: false,
            ci: false,
        });

        assert.equal(result.ciFailed, false);
        assert.ok(result.reportPath.length > 0);
        assert.equal(result.report.schemaVersion, '2.0.0');
        assert.ok(await fs.stat(result.reportPath));
        assert.ok(result.semanticReport.summary.nonBreaking >= 1);
    });

    test('sets ciFailed=true after write when ci and governance errors', async () => {
        const reportPath = path.join(tempDir, 'ci-fail.json');
        const result = await runAnalyzeDiffPipeline({
            oldSpec,
            newSpec: newSpecBreaking,
            base: 'compare-with:old',
            target: 'new',
            reportPath,
            plugins: [],
            ignoreRules: [],
            allowBreaking: false,
            ci: true,
        });

        assert.equal(result.ciFailed, true);
        assert.ok(result.semanticReport.governance.summary.errors > 0);
        assert.ok(await fs.stat(result.reportPath));
    });

    test('keeps ciFailed=false for breaking diff when ci is false', async () => {
        const reportPath = path.join(tempDir, 'no-ci.json');
        const result = await runAnalyzeDiffPipeline({
            oldSpec,
            newSpec: newSpecBreaking,
            base: 'compare-with:old',
            target: 'new',
            reportPath,
            plugins: [],
            ignoreRules: [],
            allowBreaking: false,
            ci: false,
        });

        assert.equal(result.ciFailed, false);
        assert.ok(result.semanticReport.governance.summary.errors > 0);
        assert.ok(await fs.stat(result.reportPath));
    });
});
