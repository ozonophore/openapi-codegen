import fs from 'fs';

import { DEFAULT_ANALYZE_DIFF_REPORT_PATH } from '../../common/Consts';
import type { Logger } from '../../common/Logger';
import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { SEMANTIC_DIFF_REPORT_SCHEMA_VERSION, type SemanticDiffReport } from '../semanticDiff/analyzeOpenApiDiff';
import { type DiffReport, type DiffReportEntry, UNIFIED_DIFF_REPORT_SCHEMA_VERSION, type UnifiedDiffReport } from '../types/DiffReport.model';
import { adaptSemanticToStructural } from './adapters';

/** Реэкспорт типов legacy diff-отчёта. */
export type { DiffReport, DiffReportEntry };

type LoadDiffReportParams = {
    useHistory?: boolean;
    diffReport?: string;
    inputPath?: string;
    logger: Logger;
};

const isSemanticDiffReport = (value: unknown): value is SemanticDiffReport => {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const report = value as SemanticDiffReport;
    return report.schemaVersion === SEMANTIC_DIFF_REPORT_SCHEMA_VERSION && Array.isArray(report.changes);
};

const isUnifiedDiffReport = (value: unknown): value is UnifiedDiffReport => {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const report = value as UnifiedDiffReport;
    return report.schemaVersion === UNIFIED_DIFF_REPORT_SCHEMA_VERSION && !!report.structural && Array.isArray(report.structural.diff?.all);
};

const convertSemanticReportToLegacy = (report: SemanticDiffReport): DiffReport => {
    const structural = adaptSemanticToStructural(report);

    return {
        version: report.schemaVersion,
        diff: structural.diff,
        miracles: structural.miracles,
        stats: structural.stats,
    };
};

const convertUnifiedReportToLegacy = (report: UnifiedDiffReport): DiffReport => {
    return {
        version: report.schemaVersion,
        timestamp: report.timestamp,
        metadata: report.metadata,
        diff: report.structural.diff,
        miracles: report.structural.miracles,
        stats: report.structural.stats,
    };
};

const isFreshEnough = (reportPath: string, inputPath?: string): boolean => {
    if (!inputPath) return true;
    try {
        const reportStat = fs.statSync(reportPath);
        const inputStat = fs.statSync(inputPath);
        return reportStat.mtimeMs >= inputStat.mtimeMs;
    } catch {
        return true;
    }
};

/**
 * Загружает diff-отчёт с диска и приводит его к legacy-формату для генерации.
 * @param useHistory признак использования истории изменений
 * @param [diffReport] путь к файлу отчёта
 * @param [inputPath] путь к входной спецификации для проверки актуальности отчёта
 * @param logger логгер для диагностических сообщений
 * @returns legacy diff-отчёт или null, если отчёт отсутствует или устарел
 */
export const loadDiffReport = ({ useHistory, diffReport, inputPath, logger }: LoadDiffReportParams): DiffReport | null => {
    const shouldLoad = useHistory || !!diffReport;
    if (!shouldLoad) return null;

    const reportPath = diffReport || DEFAULT_ANALYZE_DIFF_REPORT_PATH;
    if (!fs.existsSync(reportPath)) {
        logger.info(LOGGER_MESSAGES.DIFF_REPORT.NOT_FOUND(reportPath));
        return null;
    }

    if (!isFreshEnough(reportPath, inputPath)) {
        logger.warn(LOGGER_MESSAGES.DIFF_REPORT.STALE(reportPath));
        return null;
    }

    try {
        const raw = fs.readFileSync(reportPath, 'utf-8');
        const parsed = JSON.parse(raw) as DiffReport | SemanticDiffReport | UnifiedDiffReport;

        if (isUnifiedDiffReport(parsed)) {
            const legacyReport = convertUnifiedReportToLegacy(parsed);
            const hasDiffEntries = !!legacyReport.diff?.all?.length;
            const hasMiracles = !!legacyReport.miracles?.length;
            if (!hasDiffEntries && !hasMiracles) {
                logger.info(LOGGER_MESSAGES.DIFF_REPORT.EMPTY(reportPath));
                return null;
            }
            logger.info(LOGGER_MESSAGES.DIFF_REPORT.LOADED(reportPath, legacyReport.diff?.all?.length ?? 0, legacyReport.miracles?.length ?? 0));
            return legacyReport;
        }

        if (isSemanticDiffReport(parsed)) {
            if (!parsed.changes.length) {
                logger.info(LOGGER_MESSAGES.DIFF_REPORT.EMPTY(reportPath));
                return null;
            }

            const legacyReport = convertSemanticReportToLegacy(parsed);
            logger.info(LOGGER_MESSAGES.DIFF_REPORT.LOADED(reportPath, legacyReport.diff?.all?.length ?? 0, legacyReport.miracles?.length ?? 0));
            return legacyReport;
        }

        const legacyReport = parsed as DiffReport;
        const hasDiffEntries = !!legacyReport?.diff?.all?.length;
        const hasMiracles = !!legacyReport?.miracles?.length;
        if (!hasDiffEntries && !hasMiracles) {
            logger.info(LOGGER_MESSAGES.DIFF_REPORT.EMPTY(reportPath));
            return null;
        }
        logger.info(LOGGER_MESSAGES.DIFF_REPORT.LOADED(reportPath, legacyReport.diff?.all?.length ?? 0, legacyReport.miracles?.length ?? 0));
        return legacyReport;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.warn(LOGGER_MESSAGES.DIFF_REPORT.READ_FAILED(reportPath, message));
        return null;
    }
};
