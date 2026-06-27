import { Logger } from '../../common/Logger';
import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { CommonOpenApi } from '../types/shared/CommonOpenApi.model';
import { AnomalyDetector } from './AnomalyDetector';
import { AnomalyDetectionConfig, AnomalyReport } from './types';
import { writeAnomalyReport } from './writeAnomalyReport';

function logAnomalyReportSummary(logger: Logger, report: AnomalyReport): void {
    if (report.totalAnomalies === 0) {
        logger.info('Anomaly detection: no anomalies found');
        return;
    }

    logger.info('Anomaly Detection Report:');
    logger.info(`  Total anomalies: ${report.totalAnomalies}`);
    logger.info(`  Critical: ${report.criticalAnomalies}`);
    logger.info(`  Performance gain: ${report.summary.estimatedPerformanceGain}`);

    for (const anomaly of report.anomalies.slice(0, 5)) {
        logger.info(`  - ${anomaly.type}: ${anomaly.description}`);
    }

    if (report.anomalies.length > 5) {
        logger.info(`  ... and ${report.anomalies.length - 5} more`);
    }

    if (report.recommendations.length > 0) {
        logger.info('  Recommendations:');
        for (const rec of report.recommendations.slice(0, 3)) {
            logger.info(`  - ${rec.title}: ${rec.description}`);
        }
    }
}

/**
 * Запускает детекцию аномалий, пишет отчёт и при необходимости прерывает генерацию.
 * @param spec распарсенная OpenAPI-спецификация
 * @param config настройки детекции и отчёта
 * @param logger логгер генерации
 * @returns отчёт с найденными аномалиями
 */
export async function runAnomalyDetection(spec: CommonOpenApi, config: AnomalyDetectionConfig, logger: Logger): Promise<AnomalyReport> {
    const detector = new AnomalyDetector();
    const report = detector.detectAndReport(spec, config);

    logAnomalyReportSummary(logger, report);

    const reportPath = await writeAnomalyReport(report, config);
    logger.forceInfo(LOGGER_MESSAGES.GENERATION.ANOMALY_REPORT_CREATED(reportPath));

    if (config.failOnAnomalies && report.criticalAnomalies > 0) {
        throw new Error(`Anomaly detection failed with ${report.criticalAnomalies} critical anomaly(ies). Report: ${reportPath}`);
    }

    return report;
}
