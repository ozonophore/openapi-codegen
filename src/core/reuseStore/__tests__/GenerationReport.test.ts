import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, test } from 'node:test';

import { type GenerationReport, writeGenerationReport } from '../GenerationReport';

describe('@unit: GenerationReport', () => {
    test('writes latest.json with specQuality section', async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openapi-codegen-report-'));
        try {
            const report: GenerationReport = {
                generatedAt: new Date().toISOString(),
                generatorVersion: 'test',
                specs: [],
                reuse: { totalHits: 0, totalMisses: 0, conflicts: [] },
                specQuality: {
                    perSpec: [],
                    crossSpec: [],
                    summary: { high: 0, medium: 0, low: 0, info: 0 },
                    failOnHighTriggered: false,
                },
            };

            const reportPath = await writeGenerationReport(tmpDir, report);
            assert.match(reportPath, /reports\/latest\.json$/);
            const parsed = JSON.parse(fs.readFileSync(reportPath, 'utf8')) as GenerationReport;
            assert.ok(parsed.specQuality);
            assert.equal(parsed.specQuality?.summary.high, 0);
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });
});
