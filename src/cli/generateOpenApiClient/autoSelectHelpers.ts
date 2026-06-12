import * as path from 'path';

import { Logger } from '../../common/Logger';
import { TFlatOptions, TRawOptions } from '../../common/TRawOptions';
import { normalizeMarauderBoolean } from '../../common/VersionedSchema/Utils/createBooleanToObjectSchema';
import { AutoSelector } from '../../core/autoSelect';
import type { AutoSelectResult } from '../../core/autoSelect/types';

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
 * Builds flat probe options for AutoSelector from merged config.
 * For `items[]` without root output, uses the first item's input and output.
 */
export function resolveAutoSelectProbeOptions(mergedOptions: TRawOptions): TFlatOptions {
    const { items, ...rootOptions } = mergedOptions;

    if (rootOptions.input && rootOptions.output) {
        return {
            ...rootOptions,
            input: rootOptions.input,
            output: rootOptions.output,
        } as TFlatOptions;
    }

    if (items && items.length > 0) {
        const firstItem = items[0]!;
        return {
            ...rootOptions,
            input: firstItem.input,
            output: firstItem.output,
        } as TFlatOptions;
    }

    return {
        ...rootOptions,
        input: rootOptions.input ?? '',
        output: rootOptions.output ?? '',
    } as TFlatOptions;
}

function resolveUniqueOutputProbeOptions(mergedOptions: TRawOptions): TFlatOptions[] {
    const { items, ...rootOptions } = mergedOptions;

    if (!items || items.length === 0) {
        return [resolveAutoSelectProbeOptions(mergedOptions)];
    }

    const seenOutputs = new Set<string>();
    const probes: TFlatOptions[] = [];

    for (const item of items) {
        if (!item.output) {
            continue;
        }

        const resolvedOutput = path.resolve(process.cwd(), item.output);
        if (seenOutputs.has(resolvedOutput)) {
            continue;
        }

        seenOutputs.add(resolvedOutput);
        probes.push({
            ...rootOptions,
            input: item.input,
            output: item.output,
        } as TFlatOptions);
    }

    if (probes.length === 0) {
        return [resolveAutoSelectProbeOptions(mergedOptions)];
    }

    return probes;
}

function recommendationsMatch(first: AutoSelectResult, other: AutoSelectResult): boolean {
    return first.validator === other.validator && first.httpClient === other.httpClient;
}

function logAutoSelectResult(result: AutoSelectResult, logger: Logger): void {
    logger.info(`✨ AutoSelector recommendations:`);
    logger.info(`  Validator: ${result.validator}`);
    logger.info(`  HTTP Client: ${result.httpClient}`);

    for (const recommendation of result.recommendations) {
        if (recommendation.priority === 'high') {
            logger.info(`  ⚠️  ${recommendation.title}: ${recommendation.description}`);
        }
    }
}

function resolveResultForOutput(output: string, probeOptionsList: TFlatOptions[], results: AutoSelectResult[], fallback: AutoSelectResult): AutoSelectResult {
    const resolvedOutput = path.resolve(process.cwd(), output);
    const probeIndex = probeOptionsList.findIndex(probe => path.resolve(process.cwd(), probe.output ?? '') === resolvedOutput);
    return probeIndex >= 0 ? (results[probeIndex] ?? fallback) : fallback;
}

/**
 * Выполняет AutoSelector при включённом autoSelect и возвращает рекомендованные опции.
 * @param options плоские или multi-item опции генерации
 * @param logger логгер CLI
 * @returns частичные опции для merge перед generate
 */
export function executeAutoSelection(options: TRawOptions, logger: Logger): Partial<TRawOptions> {
    const autoSelect = normalizeMarauderBoolean(options.autoSelect);
    if (!autoSelect?.enabled) {
        return {};
    }

    const selector = new AutoSelector();
    const probeOptionsList = resolveUniqueOutputProbeOptions(options);
    const results: AutoSelectResult[] = [];

    for (const probeOptions of probeOptionsList) {
        const targetDir = resolveProjectAnalysisDir(probeOptions);

        try {
            results.push(selector.selectOptimal(targetDir, autoSelect));
        } catch (error) {
            logger.warn(`AutoSelector failed for ${targetDir}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    if (results.length === 0) {
        return {};
    }

    const primaryResult = results[0]!;

    if (results.length > 1) {
        const hasMismatch = results.some(result => !recommendationsMatch(primaryResult, result));
        if (hasMismatch) {
            logger.warn('AutoSelector recommendations differ across output directories:');
            for (let index = 0; index < probeOptionsList.length; index += 1) {
                const probeOptions = probeOptionsList[index]!;
                const result = results[index];
                if (!result) {
                    continue;
                }
                logger.warn(`  ${probeOptions.output}: validator=${result.validator}, httpClient=${result.httpClient}`);
            }

            if (options.items && options.items.length > 0) {
                return {
                    items: options.items.map(item => {
                        const result = resolveResultForOutput(item.output ?? '', probeOptionsList, results, primaryResult);
                        return {
                            ...item,
                            validationLibrary: result.validator,
                            httpClient: result.httpClient,
                        };
                    }),
                };
            }
        }
    }

    logAutoSelectResult(primaryResult, logger);

    return {
        validationLibrary: primaryResult.validator,
        httpClient: primaryResult.httpClient,
    };
}
