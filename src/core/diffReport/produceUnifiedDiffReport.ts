import crypto from 'crypto';

import type { SemanticDiffReport } from '../semanticDiff/analyzeOpenApiDiff';
import { adaptSemanticToStructural } from './adapters/semanticToStructural';
import { UNIFIED_DIFF_REPORT_SCHEMA_VERSION, type UnifiedDiffReport } from './DiffReport.model';

export type ProduceUnifiedDiffReportInput = {
    semantic: SemanticDiffReport;
    base: string;
    target: string;
    baseSpec: unknown;
    targetSpec: unknown;
    ignored?: number;
    /** Override report timestamp; defaults to `new Date().toISOString()`. */
    timestamp?: string;
};

/**
 * Circular-safe MD5 hash of a Spec object for Unified DiffReport metadata.
 */
export function createSpecHash(spec: unknown): string {
    const seen = new WeakSet<object>();
    const serializedSpec = JSON.stringify(spec, (_key, value) => {
        if (value && typeof value === 'object') {
            if (seen.has(value)) {
                return '[Circular]';
            }
            seen.add(value);
        }

        return value;
    });

    return crypto
        .createHash('md5')
        .update(serializedSpec ?? '')
        .digest('hex');
}

/**
 * Assembles UnifiedDiffReport from an enriched semantic report + Spec metadata.
 * Does not run governance, miracles, hooks, or disk I/O.
 */
export function produceUnifiedDiffReport(input: ProduceUnifiedDiffReportInput): UnifiedDiffReport {
    const { semantic, base, target, baseSpec, targetSpec, ignored, timestamp } = input;

    return {
        schemaVersion: UNIFIED_DIFF_REPORT_SCHEMA_VERSION,
        timestamp: timestamp ?? new Date().toISOString(),
        metadata: {
            base,
            target,
            baseHash: createSpecHash(baseSpec),
            targetHash: createSpecHash(targetSpec),
        },
        semantic: {
            changes: semantic.changes,
            governance: semantic.governance,
            recommendation: semantic.recommendation,
            summary: semantic.summary,
        },
        structural: adaptSemanticToStructural(semantic, ignored),
    };
}
