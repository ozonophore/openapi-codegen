import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import { APP_LOGGER, DEFAULT_ANALYZE_DIFF_REPORT_PATH } from '../../common/Consts';
import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { collectDiffEntries, normalizeForDiff, withDiffType } from './diffEngine';
import { applyIgnoreRules } from './ignoreRules';
import { buildMiracles } from './miracles';
import type { DiffReport, DiffStats, IgnoreRule, JsonValue } from './types';

/**
 * Собирает итоговый отчет по сравнению двух спецификаций: хеши, статистика, diff и miracles.
 * @param params объект с полями baseLabel, targetLabel, oldSpec, newSpec, ignoreRules
 * @returns объект с полем report и числом ignored
 */
export const buildReport = (params: { baseLabel: string; targetLabel: string; oldSpec: JsonValue; newSpec: JsonValue; ignoreRules: IgnoreRule[] }): { report: DiffReport; ignored: number } => {
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
};

export const writeReportToFile = (report: DiffReport, reportPath: string = DEFAULT_ANALYZE_DIFF_REPORT_PATH): void => {
    const reportDir = path.dirname(reportPath);

    if (reportDir && reportDir !== '.' && !fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

    APP_LOGGER.info(LOGGER_MESSAGES.SEPARATOR);
    APP_LOGGER.info('[openapi-codegen] Analyze-diff summary');
    APP_LOGGER.info(`Base: ${report.metadata.base}`);
    APP_LOGGER.info(`Target: ${report.metadata.target}`);

    if (report.stats.stabilityScore !== undefined) {
        APP_LOGGER.info(`Stability score: ${report.stats.stabilityScore}%`);
    }

    APP_LOGGER.info(
        `Changes: total=${report.stats.totalChanges}, added=${report.stats.added}, removed=${report.stats.removed}, changed=${report.stats.changed}`
    );

    if (report.diff.breaking.length > 0) {
        APP_LOGGER.error(`[openapi-codegen] BREAKING: ${report.diff.breaking.length} item(s)`);
    }

    if (report.diff.warnings.length > 0) {
        APP_LOGGER.warn(`[openapi-codegen] WARNINGS: ${report.diff.warnings.length} item(s)`);
    }

    const ignored = report.stats.ignored ?? 0;
    if (ignored > 0) {
        APP_LOGGER.info(`[openapi-codegen] IGNORED: ${ignored} item(s) by config rules`);
    }

    APP_LOGGER.info(`[openapi-codegen] Report written to: ${reportPath}`);
};
