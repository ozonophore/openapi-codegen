import * as path from 'path';

import { Logger } from '../../common/Logger';
import { TFlatOptions } from '../../common/TRawOptions';
import { normalizeMarauderBoolean } from '../../common/VersionedSchema/Utils/createBooleanToObjectSchema';
import { AutoSelector } from '../../core/autoSelect';

function isUrlLike(value: string): boolean {
    return /^[a-z][a-z\d+\-.]*:/i.test(value);
}

/**
 * Resolves the project directory for AutoSelector analysis.
 * @param options плоские опции генерации
 * @returns абсолютный путь к директории анализа
 */
export function resolveProjectAnalysisDir(options: TFlatOptions): string {
    if (options.output) {
        return path.resolve(process.cwd(), options.output);
    }

    const input = options.input;
    if (input && !isUrlLike(input)) {
        const resolvedInput = path.resolve(process.cwd(), input);
        return path.dirname(resolvedInput);
    }

    return process.cwd();
}

/**
 * Выполняет AutoSelector при включённом autoSelect и возвращает рекомендованные опции.
 * @param options плоские опции генерации
 * @param logger логгер CLI
 * @returns частичные опции для merge перед generate
 */
export function executeAutoSelection(options: TFlatOptions, logger: Logger): Partial<TFlatOptions> {
    const autoSelect = normalizeMarauderBoolean(options.autoSelect);
    if (!autoSelect?.enabled) {
        return {};
    }

    const selector = new AutoSelector();
    const targetDir = resolveProjectAnalysisDir(options);

    try {
        const result = selector.selectOptimal(targetDir, autoSelect);

        logger.info(`✨ AutoSelector recommendations:`);
        logger.info(`  Validator: ${result.validator}`);
        logger.info(`  HTTP Client: ${result.httpClient}`);

        for (const recommendation of result.recommendations) {
            if (recommendation.priority === 'high') {
                logger.info(`  ⚠️  ${recommendation.title}: ${recommendation.description}`);
            }
        }

        return {
            validationLibrary: result.validator,
            httpClient: result.httpClient,
        };
    } catch (error) {
        logger.warn(`AutoSelector failed: ${error instanceof Error ? error.message : String(error)}`);
        return {};
    }
}
