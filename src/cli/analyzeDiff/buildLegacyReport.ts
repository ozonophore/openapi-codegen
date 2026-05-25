import crypto from 'crypto';

import { collectDiffEntries, normalizeForDiff, withDiffType } from './diffEngine';
import { applyIgnoreRules } from './ignoreRules';
import { buildMiracles } from './miracles';
import type { DiffReport, DiffStats, IgnoreRule, JsonValue } from './types';

type BuildLegacyReportParams = {
    baseLabel: string;
    targetLabel: string;
    oldSpec: JsonValue;
    newSpec: JsonValue;
    ignoreRules: IgnoreRule[];
};

/**
 * Собирает legacy diff-отчет по сравнению двух спецификаций.
 */
export function buildLegacyReport(params: BuildLegacyReportParams): { report: DiffReport; ignored: number } {
    const { baseLabel, targetLabel, oldSpec, newSpec, ignoreRules } = params;
    const normalizedOld = normalizeForDiff(oldSpec);
    const normalizedNew = normalizeForDiff(newSpec);
    const baseHash = crypto.createHash('sha256').update(JSON.stringify(normalizedOld)).digest('hex');
    const targetHash = crypto.createHash('sha256').update(JSON.stringify(normalizedNew)).digest('hex');

    const entries = withDiffType(collectDiffEntries(normalizedOld, normalizedNew));
    const { filtered, ignored } = applyIgnoreRules(entries, ignoreRules);
    const breakingCount = filtered.filter(entry => entry.severity === 'breaking').length;
    const stabilityScore = filtered.length === 0 ? 100 : Math.round(((filtered.length - breakingCount) / filtered.length) * 100);

    const stats: DiffStats = {
        totalChanges: filtered.length,
        added: filtered.filter(entry => entry.action === 'added').length,
        removed: filtered.filter(entry => entry.action === 'removed').length,
        changed: filtered.filter(entry => entry.action === 'changed').length,
        ignored: ignored || undefined,
        stabilityScore,
    };

    const breaking = filtered.filter(entry => entry.severity === 'breaking');
    const warnings = filtered.filter(entry => entry.severity === 'warning');
    const info = filtered.filter(entry => entry.severity === 'info');

    const report: DiffReport = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        metadata: {
            base: baseLabel,
            target: targetLabel,
            baseHash,
            targetHash,
        },
        stats,
        diff: {
            breaking,
            warnings,
            info,
            all: filtered,
        },
        miracles: buildMiracles(entries, normalizedOld, normalizedNew),
    };

    return { report, ignored };
}
