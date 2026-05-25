import { OptionValues } from 'commander';

import { APP_LOGGER, DEFAULT_ANALYZE_DIFF_REPORT_PATH } from '../../common/Consts';
import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { loadConfigIfExists } from '../../common/utils/loadConfigIfExists';
import { validateZodOptions } from '../../common/Validation/validateZodOptions';
import { AnalyzeDiffOptions, analyzeDiffOptionsSchema } from '../schemas';
import { getIgnoreRulesFromConfig } from './ignoreRules';
import { buildReport, writeReportToFile } from './report';
import { parseSpecFile, readSpecFromGit } from './specParser';
import { AnalyzeDiffResult, JsonValue } from './types';

export const analyzeDiff = async (options: OptionValues): Promise<AnalyzeDiffResult> => {
    const validationResult = validateZodOptions(analyzeDiffOptionsSchema, options);

    if (!validationResult.success) {
        const msg = validationResult.errors.join('\n');
        APP_LOGGER.error(LOGGER_MESSAGES.ERROR.GENERIC(msg));
        await APP_LOGGER.shutdownLoggerAsync();
        return { success: false, error: msg };
    }

    const validatedOptions = validationResult.data as AnalyzeDiffOptions;

    const inputPath = validatedOptions.input;
    const compareWith = validatedOptions.compareWith;
    const gitRef = validatedOptions.git;
    const reportPath = validatedOptions.outputReport || DEFAULT_ANALYZE_DIFF_REPORT_PATH;

    if (!inputPath) {
        const msg = '"--input" option is required for analyze-diff command';
        APP_LOGGER.error(LOGGER_MESSAGES.ERROR.GENERIC(msg));
        await APP_LOGGER.shutdownLoggerAsync();
        return { success: false, error: msg };
    }

    if (!compareWith && !gitRef) {
        APP_LOGGER.info('History analysis skipped: no base spec provided (use --compare-with or --git)');
        await APP_LOGGER.shutdownLoggerAsync();
        return { success: true, skipped: true };
    }

    try {
        APP_LOGGER.info('\n[openapi-codegen] Analyzing OpenAPI changes...');

        const targetSpec = await parseSpecFile(inputPath);

        let baseSpec: JsonValue;
        let baseLabel: string;

        if (compareWith) {
            baseSpec = await parseSpecFile(compareWith);
            baseLabel = compareWith;
        } else {
            baseSpec = await readSpecFromGit(gitRef as string, inputPath);
            baseLabel = `git:${gitRef}`;
        }

        const configData = loadConfigIfExists(validatedOptions.openapiConfig);
        const ignoreRules = getIgnoreRulesFromConfig(configData);
        const { report, ignored } = buildReport({
            baseLabel,
            targetLabel: inputPath,
            oldSpec: baseSpec,
            newSpec: targetSpec,
            ignoreRules,
        });

        writeReportToFile(report, reportPath);
        await APP_LOGGER.shutdownLoggerAsync();
        return { success: true, reportPath, ignored };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        APP_LOGGER.error(LOGGER_MESSAGES.ERROR.GENERIC(message));
        await APP_LOGGER.shutdownLoggerAsync();
        return { success: false, error: message };
    }
};
