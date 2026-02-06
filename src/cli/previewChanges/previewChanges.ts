import { OptionValues } from 'commander';
import * as diff from 'diff';

import { APP_LOGGER } from '../../common/Consts';
import { EMigrationMode } from '../../common/Enums';
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
import { previewChangesSchema,TPreviewChangesOptions } from '../schemas';
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

/**
 * Основная функция для предпросмотра изменений
 * 
 * TODO: Добавить проверку опций команды перед выполнением
 */
export async function previewChanges(options: OptionValues): Promise<void> {
    const validationResult = validateZodOptions(previewChangesSchema, options);

    if (!validationResult.success) {
        APP_LOGGER.error(validationResult.errors.join('\n'));
        process.exit(1);
    }

    const { openapiConfig, generatedDir, previewDir, diffDir } = validationResult.data as TPreviewChangesOptions;

    const resolvedGeneratedDir = resolveHelper(process.cwd(), generatedDir || '');
    const resolvedPreviewDir = resolveHelper(process.cwd(), previewDir || '');
    const resolvedDiffDir = resolveHelper(process.cwd(), diffDir || '');

    let previewDirCreated = false;

    try {
        // 1. Проверка директории со сгенерированным кодом
        if (await isDirectoryEmpty(resolvedGeneratedDir)) {
            APP_LOGGER.info(`Directory "${generatedDir}" is empty or does not exist. Nothing to compare.`);
            process.exit(0);
        }

        // 2. Создание временной директории для preview
        await fileSystemHelpers.mkdir(resolvedPreviewDir);
        previewDirCreated = true;

        // 3. Загрузка конфигурации
        const configData = loadConfigIfExists(openapiConfig);
        if (!configData) {
            APP_LOGGER.error('The configuration file is missing');
            process.exit(1);
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
            APP_LOGGER.error("Couldn't convert the set of options to the current version");
            process.exit(1);
        }

        // 4. Обновление путей output для генерации в preview директорию
        const migratedValue = migratedOptions.value as TRawOptions;
        const previewOptions = updateOutputPaths(migratedValue, previewDir || '', generatedDir || '') as TRawOptions;

        // 5. Генерация кода в preview директорию
        APP_LOGGER.info(`Generating code to preview directory: ${previewDir}`);
        await OpenAPI.generate(previewOptions);

        // 6. Сравнение файлов
        APP_LOGGER.info('Comparing files...');
        const oldFiles = await readDirectoryRecursive(resolvedGeneratedDir);
        const newFiles = await readDirectoryRecursive(resolvedPreviewDir);

        const allFiles = new Set([...oldFiles, ...newFiles]);
        const changes: FileChange[] = [];

        for (const file of allFiles) {
            const oldPath = joinHelper(resolvedGeneratedDir, file);
            const newPath = joinHelper(resolvedPreviewDir, file);
            const oldExists = await fileSystemHelpers.exists(oldPath);
            const newExists = await fileSystemHelpers.exists(newPath);

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
                    APP_LOGGER.info(`File "${file}" has no changes`);
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
                APP_LOGGER.info(`Diff saved: ${diffFilePath}`);
            }

            APP_LOGGER.info(`\nTotal changes: ${changes.length}`);
            APP_LOGGER.info(`Diff files saved to: ${diffDir}`);
        } else {
            APP_LOGGER.info('No changes detected. All files are identical.');
        }

        // 8. Удаление временной директории preview
        APP_LOGGER.info(`Cleaning up preview directory: ${previewDir}`);
        await fileSystemHelpers.rmdir(resolvedPreviewDir);
        previewDirCreated = false;

        process.exit(0);
    } catch (error: any) {
        // Очистка preview директории в случае ошибки
        if (previewDirCreated) {
            try {
                APP_LOGGER.info(`Cleaning up preview directory after error: ${previewDir}`);
                await fileSystemHelpers.rmdir(resolvedPreviewDir);
            } catch (cleanupError: any) {
                APP_LOGGER.error(`Failed to cleanup preview directory: ${cleanupError.message}`);
            }
        }
        APP_LOGGER.error(error.message);
        process.exit(1);
    }
}
