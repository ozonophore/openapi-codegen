import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import type { SemanticDiffReport } from '../../semanticDiff/analyzeOpenApiDiff';
import { UNIFIED_DIFF_REPORT_SCHEMA_VERSION } from '../DiffReport.model';
import { createSpecHash, produceUnifiedDiffReport } from '../produceUnifiedDiffReport';

describe('@unit: produceUnifiedDiffReport', () => {
    test('createSpecHash is stable and circular-safe', () => {
        const a: Record<string, unknown> = { openapi: '3.0.0' };
        a.self = a;
        const hash = createSpecHash(a);
        assert.match(hash, /^[a-f0-9]{32}$/);
        assert.equal(createSpecHash(a), hash);
        assert.notEqual(createSpecHash({ openapi: '3.0.0' }), hash);
    });

    test('assembles UnifiedDiffReport with metadata hashes and structural part', () => {
        const semantic: SemanticDiffReport = {
            schemaVersion: '1.1.0',
            summary: { breaking: 0, nonBreaking: 0, informational: 0 },
            recommendation: {
                semver: 'patch',
                confidence: 'high',
                reason: 'ok',
                reasons: ['NO_API_SURFACE_CHANGES'],
            },
            governance: {
                summary: { errors: 0, warnings: 0, info: 0 },
                violations: [],
            },
            changes: [],
            miracles: [],
        };

        const report = produceUnifiedDiffReport({
            semantic,
            base: 'git:main',
            target: './new.yaml',
            baseSpec: { openapi: '3.0.0', info: { title: 'old', version: '1' } },
            targetSpec: { openapi: '3.0.0', info: { title: 'new', version: '2' } },
            ignored: 2,
            timestamp: '2026-08-09T00:00:00.000Z',
        });

        assert.equal(report.schemaVersion, UNIFIED_DIFF_REPORT_SCHEMA_VERSION);
        assert.equal(report.timestamp, '2026-08-09T00:00:00.000Z');
        assert.equal(report.metadata.base, 'git:main');
        assert.equal(report.metadata.target, './new.yaml');
        assert.equal(report.metadata.baseHash, createSpecHash({ openapi: '3.0.0', info: { title: 'old', version: '1' } }));
        assert.equal(report.metadata.targetHash, createSpecHash({ openapi: '3.0.0', info: { title: 'new', version: '2' } }));
        assert.deepEqual(report.semantic.summary, semantic.summary);
        assert.equal(report.structural.stats.ignored, 2);
        assert.ok(Array.isArray(report.structural.diff.all));
    });
});
