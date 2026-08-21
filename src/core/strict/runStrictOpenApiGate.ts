import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { loadGovernanceConfig } from '../governance/loadGovernanceConfig';
import type { CommonOpenApi } from '../types/shared/CommonOpenApi.model';
import { type StrictOpenApiReport, validateOpenApiStrict, validateWithSwaggerParser, writeOpenApiStrictReport } from './validateOpenApiStrict';

export type StrictOpenApiGateLogger = {
    forceInfo: (message: string) => void;
};

export type RunStrictOpenApiGateInput = {
    absoluteInput: string;
    openApi: CommonOpenApi;
    context: Parameters<typeof validateOpenApiStrict>[0]['context'];
    reportFile: string;
    governanceConfig?: string;
    failOnGovernanceErrors?: boolean;
    logger: StrictOpenApiGateLogger;
};

export type RunStrictOpenApiGateResult = {
    reportPath: string;
    report: StrictOpenApiReport;
};

export type StrictOpenApiGateDeps = {
    validateWithSwaggerParser: typeof validateWithSwaggerParser;
    loadGovernanceConfig: typeof loadGovernanceConfig;
    validateOpenApiStrict: typeof validateOpenApiStrict;
    writeOpenApiStrictReport: typeof writeOpenApiStrictReport;
};

const defaultDeps: StrictOpenApiGateDeps = {
    validateWithSwaggerParser,
    loadGovernanceConfig,
    validateOpenApiStrict,
    writeOpenApiStrictReport,
};

/**
 * Runs the generate-path Strict OpenAPI gate: parser validate → load governance →
 * strict diagnostics → write report → log → fail gates.
 */
export async function runStrictOpenApiGate(input: RunStrictOpenApiGateInput, deps: StrictOpenApiGateDeps = defaultDeps): Promise<RunStrictOpenApiGateResult> {
    const parserValidationIssues = await deps.validateWithSwaggerParser(input.absoluteInput);
    const governancePolicy = await deps.loadGovernanceConfig(input.governanceConfig);
    const report = deps.validateOpenApiStrict({
        openApi: input.openApi,
        context: input.context,
        preIssues: parserValidationIssues,
        governanceConfig: governancePolicy,
    });
    const reportPath = await deps.writeOpenApiStrictReport(report, input.reportFile);
    input.logger.forceInfo(LOGGER_MESSAGES.GENERATION.STRICT_REPORT_CREATED(reportPath));

    if (report.summary.errors > 0) {
        throw new Error(`Strict OpenAPI validation failed with ${report.summary.errors} error(s). Report: ${reportPath}`);
    }

    if (input.failOnGovernanceErrors && report.governance.summary.errors > 0) {
        throw new Error(`Governance validation failed with ${report.governance.summary.errors} error(s). Report: ${reportPath}`);
    }

    return { reportPath, report };
}
