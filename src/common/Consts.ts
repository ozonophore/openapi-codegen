import { EmptySchemaStrategy } from '../core/types/enums/EmptySchemaStrategy.enum';
import { HttpClient } from '../core/types/enums/HttpClient.enum';
import { ModelsLayout } from '../core/types/enums/ModelsLayout.enum';
import { ModelsMode } from '../core/types/enums/ModelsMode.enum';
import { ValidationLibrary } from '../core/types/enums/ValidationLibrary.enum';
import { ELogLevel, ELogOutput } from './Enums';
import { Logger } from './Logger';
import { TStrictFlatOptions } from './TRawOptions';

export const DEFAULT_OPENAPI_CONFIG_FILENAME = 'openapi.config.json';
export const DEFAULT_REPORTS_DIR = './.openapi-codegen-reports';

export const buildDefaultReportPath = (fileName: string): string => `${DEFAULT_REPORTS_DIR}/${fileName}`;

export const DEFAULT_ANALYZE_DIFF_REPORT_PATH = buildDefaultReportPath('openapi-diff-report.json');
export const DEFAULT_ANALYZE_USAGE_REPORT_PATH = buildDefaultReportPath('openapi-usage-report.json');

export const COMMON_DEFAULT_OPTIONS_VALUES: TStrictFlatOptions = {
    input: '',
    output: '',
    outputCore: '',
    outputServices: '',
    outputModels: '',
    outputSchemas: '',
    httpClient: HttpClient.FETCH,
    useOptions: false,
    useUnionTypes: false,
    includeSchemasFiles: false,
    excludeCoreServiceFiles: false,
    request: '',
    plugins: [],
    customExecutorPath: '',
    interfacePrefix: 'I',
    enumPrefix: 'E',
    typePrefix: 'T',
    useCancelableRequest: false,
    logLevel: ELogLevel.ERROR,
    logTarget: ELogOutput.CONSOLE,
    sortByRequired: false,
    useSeparatedIndexes: false,
    validationLibrary: ValidationLibrary.NONE,
    emptySchemaStrategy: EmptySchemaStrategy.KEEP,
    useHistory: false,
    diffReport: DEFAULT_ANALYZE_DIFF_REPORT_PATH,
    modelsMode: ModelsMode.INTERFACES,
    modelsLayout: ModelsLayout.BUNDLE,
    models: { layout: ModelsLayout.BUNDLE },
    analyze: {},
    miracles: {},
    strictOpenapi: false,
    reportFile: buildDefaultReportPath('openapi-report.json'),
    failOnGovernanceErrors: false,
    governanceConfig: '',
    cache: false,
    cachePath: '.openapi-codegen-store',
    cacheStrategy: 'reuse',
    cacheDebug: false,
    reuseOnConflict: 'fail',
    prettierConfigPath: '',
    autoSelect: {
        enabled: false,
        strict: false,
        preferSmallBundles: false,
        preferStandards: false,
    },
    specAnalysis: {
        enabled: false,
        severity: 'medium',
        reportFormat: 'json',
        reportPath: buildDefaultReportPath('anomaly-report.json'),
        failOnHigh: false,
        crossSpec: true,
        maxNestingDepth: 5,
    },
    anomalyDetection: {
        enabled: false,
        severity: 'medium',
        reportFormat: 'json',
        reportPath: buildDefaultReportPath('anomaly-report.json'),
        failOnAnomalies: false,
        maxNestingDepth: 5,
    },
    workspaceReport: {
        enabled: false,
        path: './workspace-report',
        format: 'json',
    },
    trafficSplitter: {
        enabled: false,
        strategy: 'weighted',
    },
    swarm: {
        enabled: false,
        output: './swarm-manifest.json',
    },
    preAnalyze: false,
    reuseMode: 'copy',
};

export const APP_LOGGER = new Logger({
    level: ELogLevel.INFO,
    instanceId: 'cli',
    logOutput: ELogOutput.CONSOLE,
});

export const DEFAULT_SPECS_DIR = 'openapi/';

export const DEFAULT_CUSTOM_REQUEST_PATH = './src/custom/request.ts';

export const DEFAULT_OUTPUT_API_DIR = './generated';

export const DEFAULT_PREVIEW_CHANGES_DIR = './.ts-openapi-codegen-preview-changes';

export const DEFAULT_DIFF_CHANGES_DIR = './.ts-openapi-codegen-diff-changes';
