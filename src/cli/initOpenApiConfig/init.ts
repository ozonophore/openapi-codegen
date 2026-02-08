import { OptionValues } from 'commander';

import { APP_LOGGER } from '../../common/Consts';
import { validateZodOptions } from '../../common/Validation/validateZodOptions';
import { confirmDialog } from '../interactive/confirmDialog';
import { InitOptions, initOptionsSchema } from '../schemas';
import { initConfig } from './initConfig';
import { initCustomRequest } from './initCustomRequest';
import { registerHandlebarTemplates } from './utils/registerHandlebarTemplates';

/**
 * Фнукция изначальной настройки файлов конфигурации для последующего запуска генератора
 */
export async function init(options: OptionValues) {
    const validationResult = validateZodOptions(initOptionsSchema, options);

    if (!validationResult.success) {
        APP_LOGGER.error(validationResult.errors.join('\n'));
        process.exit(1);
    }

    const validatedOptions = validationResult.data as InitOptions;

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
