import type { Logger } from '../../common/Logger';
import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { DEFAULT_EXCLUDED_ANOMALY_CATEGORIES } from '../../common/VersionedSchema/anomalyDetectorCategories';
import type { SpecAnalysisConfig } from '../analysis/types';
import { hashSchema } from '../reuseStore/ArtifactFingerprinter';
import type { ReuseStoreManifest } from '../reuseStore/types';
import type { PrefixArtifacts } from '../types/base/PrefixArtifacts.model';
import type { CommonOpenApi } from '../types/shared/CommonOpenApi.model';
import { runPerSpecAnalysis } from './CodegenSpecAnalyzer';
import { buildManifestFromParsedSpecs, runCrossSpecAnalysis } from './CrossSpecAnalyzer';
import { getSchemaDefinitions } from './detectorUtils';
import type { CrossSpecItemConfig, SpecAnalysisReport, SpecAnalysisSummary, SpecFinding } from './types';
import { writeSpecAnalysisReport } from './writeSpecAnalysisReport';

function calculateSummary(findings: SpecFinding[]): SpecAnalysisSummary {
    return {
        high: findings.filter(f => f.severity === 'high').length,
        medium: findings.filter(f => f.severity === 'medium').length,
        low: findings.filter(f => f.severity === 'low').length,
        info: findings.filter(f => f.severity === 'info').length,
    };
}

function logSpecAnalysisSummary(logger: Logger, report: SpecAnalysisReport): void {
    const total = report.perSpec.length + report.crossSpec.length;
    if (total === 0) {
        logger.info('Spec analysis: no findings');
        return;
    }

    logger.info('Spec Analysis Report:');
    logger.info(`  High: ${report.summary.high}, Medium: ${report.summary.medium}, Low: ${report.summary.low}, Info: ${report.summary.info}`);

    const preview = [...report.perSpec, ...report.crossSpec].slice(0, 5);
    for (const finding of preview) {
        logger.info(`  - ${finding.category}: ${finding.description}`);
    }

    if (total > 5) {
        logger.info(`  ... and ${total - 5} more`);
    }
}

export class SpecAnalysisAccumulator {
    private perSpecFindings: SpecFinding[] = [];
    private crossSpecFindings: SpecFinding[] = [];
    private parsedSpecs: Array<{ specItem: string; schemas: Record<string, Record<string, unknown>> }> = [];

    addPerSpecFindings(findings: SpecFinding[]): void {
        this.perSpecFindings.push(...findings);
    }

    registerParsedSpec(specItem: string, spec: CommonOpenApi): void {
        const schemas = getSchemaDefinitions(spec);
        if (!schemas) {
            return;
        }

        this.parsedSpecs.push({
            specItem,
            schemas: schemas as Record<string, Record<string, unknown>>,
        });
    }

    runCrossSpecIfEnabled(items: CrossSpecItemConfig[], config: SpecAnalysisConfig, reuseManifest?: ReuseStoreManifest): void {
        if (config.crossSpec === false) {
            return;
        }

        const manifest = reuseManifest ?? buildManifestFromParsedSpecs(this.parsedSpecs, hashSchema);
        this.crossSpecFindings = runCrossSpecAnalysis(manifest, items, config);
    }

    getReport(): SpecAnalysisReport {
        const allFindings = [...this.perSpecFindings, ...this.crossSpecFindings];
        return {
            perSpec: this.perSpecFindings,
            crossSpec: this.crossSpecFindings,
            summary: calculateSummary(allFindings),
        };
    }

    hasHighSeverityFindings(): boolean {
        return [...this.perSpecFindings, ...this.crossSpecFindings].some(finding => finding.severity === 'high');
    }
}

export function mergeSpecAnalysisConfigAcrossItems(configs: Array<SpecAnalysisConfig | undefined>): SpecAnalysisConfig {
    const severityOrder: Record<'info' | 'low' | 'medium' | 'high', number> = { info: 0, low: 1, medium: 2, high: 3 };
    let maxSeverity: 'low' | 'medium' | 'high' = 'medium';
    let crossSpec = false;
    let failOnHigh = false;

    for (const config of configs) {
        if (!config) {
            continue;
        }
        if (config.crossSpec !== false) {
            crossSpec = true;
        }
        if (config.failOnHigh || (config as { failOnAnomalies?: boolean }).failOnAnomalies) {
            failOnHigh = true;
        }
        const severity = config.severity ?? 'medium';
        if (severityOrder[severity] > severityOrder[maxSeverity]) {
            maxSeverity = severity;
        }
    }

    const base = configs.find(Boolean);
    return {
        severity: maxSeverity,
        excludeCategories: [...DEFAULT_EXCLUDED_ANOMALY_CATEGORIES],
        ...base,
        enabled: true,
        crossSpec,
        failOnHigh,
    };
}

export function createSpecAnalysisAccumulator(): SpecAnalysisAccumulator {
    return new SpecAnalysisAccumulator();
}

function shouldFailOnHigh(config: SpecAnalysisConfig, report: SpecAnalysisReport): boolean {
    const failOnHigh = config.failOnHigh ?? (config as { failOnAnomalies?: boolean }).failOnAnomalies;
    return Boolean(failOnHigh) && report.summary.high > 0;
}

export async function finalizeSpecAnalysis(
    accumulator: SpecAnalysisAccumulator,
    items: CrossSpecItemConfig[],
    config: SpecAnalysisConfig,
    logger: Logger,
    reuseManifest?: ReuseStoreManifest
): Promise<SpecAnalysisReport> {
    accumulator.runCrossSpecIfEnabled(items, config, reuseManifest);
    const report = accumulator.getReport();
    logSpecAnalysisSummary(logger, report);

    const reportPath = await writeSpecAnalysisReport(report, config);
    logger.forceInfo(LOGGER_MESSAGES.GENERATION.ANOMALY_REPORT_CREATED(reportPath));

    if (shouldFailOnHigh(config, report)) {
        throw new Error(`Spec analysis failed with ${report.summary.high} high-severity finding(s). Report: ${reportPath}`);
    }

    return report;
}

export async function runSpecAnalysis(
    spec: CommonOpenApi,
    config: SpecAnalysisConfig,
    logger: Logger,
    specInput?: string,
    accumulator?: SpecAnalysisAccumulator,
    prefixes?: PrefixArtifacts
): Promise<SpecAnalysisReport> {
    const mergedConfig: SpecAnalysisConfig = {
        severity: 'medium',
        excludeCategories: [...DEFAULT_EXCLUDED_ANOMALY_CATEGORIES],
        ...config,
        enabled: config.enabled ?? true,
    };

    const findings = runPerSpecAnalysis(spec, mergedConfig, specInput, prefixes);

    if (accumulator) {
        accumulator.addPerSpecFindings(findings);
        accumulator.registerParsedSpec(specInput ?? 'unknown', spec);
        return accumulator.getReport();
    }

    const report: SpecAnalysisReport = {
        perSpec: findings,
        crossSpec: [],
        summary: calculateSummary(findings),
    };

    logSpecAnalysisSummary(logger, report);
    const reportPath = await writeSpecAnalysisReport(report, mergedConfig);
    logger.forceInfo(LOGGER_MESSAGES.GENERATION.ANOMALY_REPORT_CREATED(reportPath));

    if (shouldFailOnHigh(mergedConfig, report)) {
        throw new Error(`Spec analysis failed with ${report.summary.high} high-severity finding(s). Report: ${reportPath}`);
    }

    return report;
}
