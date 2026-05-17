import { APP_LOGGER } from '../../common/Consts';
import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { DiffReport } from './types';

/**
 * Пишет legacy summary в лог.
 */
export function logLegacyReport(report: DiffReport, reportPath: string): void {
    APP_LOGGER.info(LOGGER_MESSAGES.SEPARATOR);
    APP_LOGGER.info(LOGGER_MESSAGES.ANALYZE_DIFF.SUMMARY(report as any, reportPath));
    APP_LOGGER.info(LOGGER_MESSAGES.ANALYZE_DIFF.LEGACY_BASE(report.metadata.base));
    APP_LOGGER.info(LOGGER_MESSAGES.ANALYZE_DIFF.LEGACY_TARGET(report.metadata.target));

    if (report.stats.stabilityScore !== undefined) {
        APP_LOGGER.info(LOGGER_MESSAGES.ANALYZE_DIFF.LEGACY_STABILITY_SCORE(report.stats.stabilityScore));
    }

    APP_LOGGER.info(LOGGER_MESSAGES.ANALYZE_DIFF.LEGACY_CHANGES(report.stats));

    if (report.diff.breaking.length > 0) {
        APP_LOGGER.error(LOGGER_MESSAGES.ANALYZE_DIFF.LEGACY_BREAKING(report.diff.breaking.length));
    }

    if (report.diff.warnings.length > 0) {
        APP_LOGGER.warn(LOGGER_MESSAGES.ANALYZE_DIFF.LEGACY_WARNINGS(report.diff.warnings.length));
    }

    const ignored = report.stats.ignored ?? 0;
    if (ignored > 0) {
        APP_LOGGER.info(LOGGER_MESSAGES.ANALYZE_DIFF.LEGACY_IGNORED(ignored));
    }

    APP_LOGGER.info(LOGGER_MESSAGES.ANALYZE_DIFF.REPORT_CREATED(reportPath));
}
