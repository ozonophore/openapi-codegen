import { OptionValues } from 'commander';

import { APP_LOGGER } from '../../common/Consts';
import { confirmDialog } from '../interactive/confirmDialog';
import { InitOptions, initOptionsSchema } from '../schemas';
import { validateCLIOptions } from '../validation';
import { initConfig } from './initConfig';
import { initCustomRequest } from './initCustomRequest';
import { registerHandlebarTemplates } from './utils/registerHandlebarTemplates';

/**
 * Фнукция изначальной настройки файлов конфигурации для последующего запуска генератора
 */
export async function init(options: OptionValues) {
    let validatedOptions: InitOptions;
    try {
        // Валидация опций через Zod
        const validationResult = validateCLIOptions(initOptionsSchema, options);

        if (!validationResult.success) {
            APP_LOGGER.error(validationResult.error);
            process.exit(1);
        }

        validatedOptions = validationResult.data as InitOptions;
    } catch (error: any) {
        APP_LOGGER.error(error.message);
        process.exit(1);
    }

    const templates = registerHandlebarTemplates();

    if (validatedOptions.useInteractiveMode) {
        const shouldInitConfig = await confirmDialog({
            message: 'Желаете сформировать конфигурационный файл для быстрого запуска генератора?',
            initial: false,
        });
        if (shouldInitConfig) {
            // TODO: генерация по шаблону!
            await initConfig({
                openapiConfig: validatedOptions.openapiConfig,
                request: validatedOptions.request,
                specsDir: validatedOptions.specsDir,
                templates,
            });
        }

        const shouldInitCustomRequest = await confirmDialog({
            message: 'Желаете сформировать файл с пользовательским вариантом обработки запросов?',
            initial: false,
        });

        if (shouldInitCustomRequest) {
            await initCustomRequest(templates, validatedOptions?.useCancelableRequest);
        }
    } else {
        await initConfig({
            openapiConfig: validatedOptions.openapiConfig,
            request: validatedOptions.request,
            specsDir: validatedOptions.specsDir,
            templates,
        });
        await initCustomRequest(templates, validatedOptions?.useCancelableRequest);
    }
}
