import { OptionValues } from 'commander';
import * as diff from 'diff';

import { APP_LOGGER } from '../../common/Consts';
import { EMigrationMode } from '../../common/Enums';
import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { TRawOptions } from '../../common/TRawOptions';
import { convertArrayToObject } from '../../common/utils/convertArrayToObject';
import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { loadConfigIfExists } from '../../common/utils/loadConfigIfExists';
import { dirNameHelper, joinHelper, resolveHelper } from '../../common/utils/pathHelpers';
import { validateZodOptions } from '../../common/Validation/validateZodOptions';
import { allMigrationPlans } from '../../common/VersionedSchema/AllVersionedSchemas/AllMigrationPlans';
import { allVersionedSchemas } from '../../common/VersionedSchema/AllVersionedSchemas/AllVersionedSchemas';
import { migrateDataToLatestSchemaVersion } from '../../common/VersionedSchema/Utils/migrateDataToLatestSchemaVersion';
import * as OpenAPI from '../../core';
import { previewChangesSchema, TPreviewChangesOptions } from '../schemas';
import { compareFiles } from './utils/compareFiles';
import { formatDiff } from './utils/formatDiff';
import { isDirectoryEmpty } from './utils/isDirectoryEmpty';
import { readDirectoryRecursive } from './utils/readDirectoryRecursive';
import { updateOutputPaths } from './utils/updateOutputPaths';

interface FileChange {
    file: string;
    status: 'added' | 'modified' | 'removed';
    diff?: diff.Change[];
}

interface ChangesSummary {
    added: string[];
    removed: string[];
    modified: string[];
    total: number;
}

function buildSummary(changes: FileChange[]): ChangesSummary {
    const added: string[] = [];
    const removed: string[] = [];
    const modified: string[] = [];

    for (const change of changes) {
        if (change.status === 'added') {
            added.push(change.file);
            continue;
        }

        if (change.status === 'removed') {
            removed.push(change.file);
            continue;
        }

        modified.push(change.file);
    }

    added.sort();
    removed.sort();
    modified.sort();

    return {
        added,
        removed,
        modified,
        total: changes.length,
    };
}

function toFileLink(filePath: string): string {
    return `./${filePath}.md`;
}

function toCategoryMarkdown(
    title: string,
    files: string[],
): string {
    const lines = [`# ${title}`, ''];

    if (files.length === 0) {
        lines.push('_No files_', '');
        return lines.join('\n');
    }

    for (const file of files) {
        lines.push(`- [${file}](${toFileLink(file)})`);
    }

    lines.push('');
    return lines.join('\n');
}

function toSummaryMarkdown(summary: ChangesSummary): string {
    return [
        '# Preview Changes Summary',
        '',
        `Total changes: ${summary.total}`,
        `Added files: ${summary.added.length}`,
        `Removed files: ${summary.removed.length}`,
        `Modified files: ${summary.modified.length}`,
        '',
        '## Reports',
        '- [Added files](./added-files.md)',
        '- [Removed files](./removed-files.md)',
        '- [Modified files](./modified-files.md)',
        '',
        '## Added',
        ...summary.added.map(file => `- [${file}](${toFileLink(file)})`),
        '',
        '## Removed',
        ...summary.removed.map(file => `- [${file}](${toFileLink(file)})`),
        '',
        '## Modified',
        ...summary.modified.map(file => `- [${file}](${toFileLink(file)})`),
        '',
    ].join('\n');
}

/**
 * Основная функция для предпросмотра изменений
 *
 * TODO: Добавить проверку опций команды перед выполнением
 */
export async function previewChanges(options: OptionValues): Promise<void> {
    let exitCode = 0;
    let resolvedPreviewDir = '';
    let previewDirCreated = false;

    try {
        const validationResult = validateZodOptions(previewChangesSchema, options);

        if (!validationResult.success) {
            APP_LOGGER.errorWithHint({
                code: 'NO_OPTIONS_PROVIDED',
                message: LOGGER_MESSAGES.ERROR.GENERIC(validationResult.errors.join('\n')),
            });
            await APP_LOGGER.shutdownLoggerAsync();
            process.exit(1);
        }

        const { openapiConfig, generatedDir, previewDir, diffDir } = validationResult.data as TPreviewChangesOptions;
        const resolvedGeneratedDir = resolveHelper(process.cwd(), generatedDir || '');
        resolvedPreviewDir = resolveHelper(process.cwd(), previewDir || '');
        const resolvedDiffDir = resolveHelper(process.cwd(), diffDir || '');

        // 1. Проверка директории со сгенерированным кодом
        if (await isDirectoryEmpty(resolvedGeneratedDir)) {
            APP_LOGGER.errorWithHint({
                code: 'PREVIEW_DIR_EMPTY',
                message: LOGGER_MESSAGES.PREVIEW.GENERATED_DIR_EMPTY(generatedDir || ''),
            });
            await APP_LOGGER.shutdownLoggerAsync();
            process.exit(1);
        }

        // 2. Загрузка конфигурации
        const configData = loadConfigIfExists(openapiConfig);
        if (!configData) {
            APP_LOGGER.errorWithHint({
                code: openapiConfig ? 'CONFIG_FILE_NOT_FOUND_AT' : 'CONFIG_FILE_MISSING',
                message: LOGGER_MESSAGES.CONFIG.FILE_MISSING,
            });
            await APP_LOGGER.shutdownLoggerAsync();
            process.exit(1);
        }

        if (Array.isArray(configData)) {
            APP_LOGGER.warn(LOGGER_MESSAGES.CONFIG.ARRAY_DEPRECATED);
        }

        const preparedOptions = convertArrayToObject(configData);

        // Миграция опций
        const migratedOptions = migrateDataToLatestSchemaVersion({
            rawInput: preparedOptions,
            migrationPlans: allMigrationPlans,
            versionedSchemas: allVersionedSchemas,
            migrationMode: EMigrationMode.GENERATE_OPENAPI,
        });

        if (!migratedOptions) {
            APP_LOGGER.errorWithHint({
                code: 'NO_VALID_SPEC_FILES_FOUND',
                message: LOGGER_MESSAGES.CONFIG.CONVERSION_FAILED,
            });
            await APP_LOGGER.shutdownLoggerAsync();
            process.exit(1);
        }

        // 3. Подготовка и создание временной директории preview
        await fileSystemHelpers.rmdir(resolvedPreviewDir);
        await fileSystemHelpers.mkdir(resolvedPreviewDir);
        previewDirCreated = true;

        // 4. Обновление путей output для генерации в preview директорию
        const migratedValue = migratedOptions.value as TRawOptions;
        const previewOptions = updateOutputPaths(migratedValue, previewDir || '', generatedDir || '') as TRawOptions;

        // 5. Генерация кода в preview директорию
        APP_LOGGER.info(LOGGER_MESSAGES.PREVIEW.GENERATING_PREVIEW(previewDir || ''));
        await OpenAPI.generate(previewOptions);

        // 6. Сравнение файлов
        APP_LOGGER.info(LOGGER_MESSAGES.PREVIEW.COMPARING_FILES);
        const oldFiles = await readDirectoryRecursive(resolvedGeneratedDir);
        const newFiles = await readDirectoryRecursive(resolvedPreviewDir);

        const oldFileSet = new Set(oldFiles);
        const newFileSet = new Set(newFiles);
        const allFiles = new Set([...oldFileSet, ...newFileSet]);
        const changes: FileChange[] = [];

        for (const file of [...allFiles].sort()) {
            const oldPath = joinHelper(resolvedGeneratedDir, file);
            const newPath = joinHelper(resolvedPreviewDir, file);
            const oldExists = oldFileSet.has(file);
            const newExists = newFileSet.has(file);

            if (oldExists && newExists) {
                // Файл существует в обеих директориях - сравниваем
                const fileDiff = await compareFiles(oldPath, newPath);
                if (fileDiff) {
                    changes.push({
                        file,
                        status: 'modified',
                        diff: fileDiff,
                    });
                } else {
                    APP_LOGGER.info(LOGGER_MESSAGES.PREVIEW.FILE_NO_CHANGES(file));
                }
            } else if (!oldExists && newExists) {
                // Новый файл
                changes.push({
                    file,
                    status: 'added',
                });
            } else if (oldExists && !newExists) {
                // Удаленный файл
                changes.push({
                    file,
                    status: 'removed',
                });
            }
        }

        // 7. Сохранение результатов в diff директорию
        if (changes.length > 0) {
            await fileSystemHelpers.rmdir(resolvedDiffDir);
            await fileSystemHelpers.mkdir(resolvedDiffDir);

            for (const change of changes) {
                const diffFilePath = joinHelper(resolvedDiffDir, `${change.file}.md`);
                const diffDirPath = dirNameHelper(diffFilePath);
                await fileSystemHelpers.mkdir(diffDirPath);

                let diffContent = '';
                if (change.status === 'added') {
                    diffContent = formatDiff(change.file, change.status);
                } else if (change.status === 'removed') {
                    diffContent = formatDiff(change.file, change.status);
                } else if (change.diff) {
                    diffContent = formatDiff(change.file, change.status, change.diff);
                }

                await fileSystemHelpers.writeFile(diffFilePath, diffContent, 'utf-8');
                APP_LOGGER.info(LOGGER_MESSAGES.PREVIEW.DIFF_SAVED(diffFilePath));
            }

            const summary = buildSummary(changes);
            await fileSystemHelpers.writeFile(
                joinHelper(resolvedDiffDir, 'added-files.md'),
                toCategoryMarkdown('Added Files', summary.added),
                'utf-8',
            );
            await fileSystemHelpers.writeFile(
                joinHelper(resolvedDiffDir, 'removed-files.md'),
                toCategoryMarkdown('Removed Files', summary.removed),
                'utf-8',
            );
            await fileSystemHelpers.writeFile(
                joinHelper(resolvedDiffDir, 'modified-files.md'),
                toCategoryMarkdown('Modified Files', summary.modified),
                'utf-8',
            );
            await fileSystemHelpers.writeFile(
                joinHelper(resolvedDiffDir, 'summary.json'),
                JSON.stringify(summary, null, 2),
                'utf-8',
            );
            await fileSystemHelpers.writeFile(
                joinHelper(resolvedDiffDir, 'summary.md'),
                toSummaryMarkdown(summary),
                'utf-8',
            );

            APP_LOGGER.info(LOGGER_MESSAGES.PREVIEW.TOTAL_CHANGES(changes.length));
            APP_LOGGER.info(LOGGER_MESSAGES.PREVIEW.DIFF_FILES_SAVED_TO(diffDir || ''));
        } else {
            await fileSystemHelpers.rmdir(resolvedDiffDir);
            APP_LOGGER.info(LOGGER_MESSAGES.PREVIEW.NO_CHANGES_DETECTED);
        }

    } catch (error: unknown) {
        exitCode = 1;
        const message = error instanceof Error ? error.message : String(error);
        APP_LOGGER.errorWithHint({
            code: 'SPEC_FILES_FIND_ERROR',
            message: LOGGER_MESSAGES.ERROR.GENERIC(message),
            error,
        });
    } finally {
        if (previewDirCreated || resolvedPreviewDir) {
            try {
                if (resolvedPreviewDir) {
                    APP_LOGGER.info(LOGGER_MESSAGES.PREVIEW.CLEANUP_PREVIEW_DIR(resolvedPreviewDir));
                    await fileSystemHelpers.rmdir(resolvedPreviewDir);
                }
            } catch (cleanupError: unknown) {
                const msg = cleanupError instanceof Error ? cleanupError.message : String(cleanupError);
                APP_LOGGER.errorWithHint({
                    code: 'PREVIEW_CLEANUP_FAILED',
                    message: LOGGER_MESSAGES.PREVIEW.CLEANUP_PREVIEW_FAILED(msg),
                    error: cleanupError,
                });
                exitCode = 1;
            }
        }
    }

    await APP_LOGGER.shutdownLoggerAsync();
    if (exitCode !== 0) {
        process.exit(1);
    }

    process.exit(0);
}
