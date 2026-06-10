import { APP_LOGGER } from '../Consts';
import { LOGGER_ERROR_CODES, LOGGER_MESSAGES } from '../LoggerMessages';
import { cleanupCodegenTempDir } from './codegenTempDir';
import { fileSystemHelpers } from './fileSystemHelpers';
import { resolveHelper } from './pathHelpers';
import { prepareTempEslintConfig } from './prepareTempEslintConfig';
import { prepareTempTsConfig } from './prepareTempTsConfig';

const DEFAULT_BATCH_SIZE = 50;
/** JSON report filename (eslint-fix-report.json) written to the project root after batch ESLint fix. */
const ESLINT_FIX_REPORT_FILE = 'eslint-fix-report.json';

/** Single ESLint diagnostic stored in {@link EslintFixReport} (no source/output). */
export interface EslintFixReportMessage {
    filePath: string;
    ruleId: string | null;
    line: number;
    column: number;
    message: string;
    severity: number;
}

/** Per-file lint messages in {@link EslintFixReport}. */
export interface EslintFixReportFile {
    filePath: string;
    messages: EslintFixReportMessage[];
}

/** Aggregated batch ESLint results written to eslint-fix-report.json. */
export interface EslintFixReport {
    summary: {
        totalFiles: number;
        errorCount: number;
        warningCount: number;
        fixableErrorCount: number;
        fixableWarningCount: number;
    };
    files: EslintFixReportFile[];
}

/** Options for {@link eslintFixBatch}. */
export interface EslintFixBatchOptions {
    /** Absolute or cwd-relative paths to generated TypeScript files. */
    files: string[];
    /** Narrow include globs for the temporary tsconfig (models/services output). */
    includeGlobs: string[];
    /** Path to the host project's base tsconfig.json. */
    tsconfigPath: string;
    /** Path to the host project's ESLint config. */
    eslintConfigPath: string;
    /** Project root (defaults to process.cwd()). */
    cwd?: string;
    /** Number of files per lintFiles call (default 50, or ESLINT_FIX_BATCH_SIZE env). */
    batchSize?: number;
}

interface ILintMessage {
    ruleId?: string | null;
    line?: number;
    column?: number;
    message?: string;
    severity?: number;
    fixable?: boolean;
}

interface ILintResult {
    filePath: string;
    messages: ILintMessage[];
    errorCount?: number;
    warningCount?: number;
    fixableErrorCount?: number;
    fixableWarningCount?: number;
}

interface IESLintConstructor {
    new (options?: Record<string, unknown>): {
        lintFiles(patterns: string[]): Promise<ILintResult[]>;
    };
    outputFixes(results: ILintResult[]): Promise<void>;
}

interface IESLintModule {
    ESLint: IESLintConstructor;
}

function getBatchSize(batchSize?: number): number {
    if (batchSize !== undefined && batchSize > 0) {
        return batchSize;
    }
    const fromEnv = Number(process.env.ESLINT_FIX_BATCH_SIZE);
    if (Number.isFinite(fromEnv) && fromEnv > 0) {
        return fromEnv;
    }
    return DEFAULT_BATCH_SIZE;
}

function* chunkArray<T>(items: T[], size: number): Generator<T[]> {
    for (let index = 0; index < items.length; index += size) {
        yield items.slice(index, index + size);
    }
}

function createEmptyReport(): EslintFixReport {
    return {
        summary: {
            totalFiles: 0,
            errorCount: 0,
            warningCount: 0,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
        },
        files: [],
    };
}

function mergeLintResults(report: EslintFixReport, results: ILintResult[]): void {
    for (const result of results) {
        const messages: EslintFixReportMessage[] = [];
        for (const message of result.messages) {
            messages.push({
                filePath: result.filePath,
                ruleId: message.ruleId ?? null,
                line: message.line ?? 0,
                column: message.column ?? 0,
                message: message.message ?? '',
                severity: message.severity ?? 1,
            });
        }

        if (messages.length > 0) {
            report.files.push({
                filePath: result.filePath,
                messages,
            });
        }

        report.summary.totalFiles += 1;
        report.summary.errorCount += result.errorCount ?? 0;
        report.summary.warningCount += result.warningCount ?? 0;
        report.summary.fixableErrorCount += result.fixableErrorCount ?? 0;
        report.summary.fixableWarningCount += result.fixableWarningCount ?? 0;
    }
}

async function tryImportESLint(): Promise<IESLintModule | null> {
    try {
        const mod = await import('eslint');
        return mod as unknown as IESLintModule;
    } catch {
        return null;
    }
}

async function writeEslintFixReport(report: EslintFixReport, cwd: string): Promise<string> {
    const reportPath = resolveHelper(cwd, ESLINT_FIX_REPORT_FILE);
    await fileSystemHelpers.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
    return reportPath;
}

/**
 * Runs ESLint --fix in memory-safe batches on an explicit file list.
 *
 * Creates temporary configs under .openapi-codegen/, lints in chunks, applies fixes,
 * writes eslint-fix-report.json, then removes temp files. Does not use projectService.
 *
 * @param options - File paths, globs, and host project config paths.
 * @returns Lint report, or null when there are no files or ESLint is not installed.
 */
export async function eslintFixBatch(options: EslintFixBatchOptions): Promise<EslintFixReport | null> {
    const cwd = options.cwd ?? process.cwd();
    const uniqueFiles = [...new Set(options.files.map(file => resolveHelper(cwd, file)))].sort();

    if (uniqueFiles.length === 0) {
        return null;
    }

    const eslintModule = await tryImportESLint();
    if (!eslintModule) {
        APP_LOGGER.warn(LOGGER_MESSAGES.FORMATTING.ESLINT_NOT_INSTALLED);
        return null;
    }

    const report = createEmptyReport();
    const batchSize = getBatchSize(options.batchSize);

    try {
        const tempTsconfigPath = await prepareTempTsConfig({
            baseTsconfigPath: options.tsconfigPath,
            includeGlobs: options.includeGlobs,
            cwd,
        });
        const tempEslintPath = await prepareTempEslintConfig({
            eslintConfigPath: options.eslintConfigPath,
            tempTsconfigPath,
            cwd,
        });

        const eslint = new eslintModule.ESLint({
            cwd,
            fix: true,
            overrideConfigFile: tempEslintPath,
        });

        for (const chunk of chunkArray(uniqueFiles, batchSize)) {
            try {
                const results = await eslint.lintFiles(chunk);
                await eslintModule.ESLint.outputFixes(results);
                mergeLintResults(report, results);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                APP_LOGGER.warn(LOGGER_MESSAGES.FORMATTING.ESLINT_BATCH_CHUNK_FAILED(message));
            }
        }

        const reportPath = await writeEslintFixReport(report, cwd);
        if (report.summary.errorCount > 0 || report.summary.warningCount > 0) {
            APP_LOGGER.warn(LOGGER_MESSAGES.FORMATTING.ESLINT_BATCH_COMPLETED_WITH_ISSUES(report.summary.errorCount, report.summary.warningCount, reportPath));
        } else {
            APP_LOGGER.info(LOGGER_MESSAGES.FORMATTING.ESLINT_BATCH_COMPLETED(reportPath));
        }

        return report;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        APP_LOGGER.errorWithHint({
            code: LOGGER_ERROR_CODES.ESLINT_FIX_FAILED,
            message: LOGGER_MESSAGES.FORMATTING.ESLINT_BATCH_FAILED(message),
            error,
        });
        throw error;
    } finally {
        await cleanupCodegenTempDir(cwd);
    }
}
