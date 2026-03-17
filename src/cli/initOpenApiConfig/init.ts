import { OptionValues } from 'commander';

import { APP_LOGGER } from '../../common/Consts';
import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
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
        APP_LOGGER.error(LOGGER_MESSAGES.ERROR.GENERIC(validationResult.errors.join('\n')));
        await APP_LOGGER.shutdownLoggerAsync();
        process.exit(1);
    }

    const validatedOptions = validationResult.data as InitOptions;

    const templates = registerHandlebarTemplates();

    if (validatedOptions.useInteractiveMode) {
        const shouldInitConfig = await confirmDialog({
            message: 'Would you like to create a configuration file for quick start of the generator?',
            initial: false,
        });
        if (shouldInitConfig) {
            await initConfig({
                openapiConfig: validatedOptions.openapiConfig,
                request: validatedOptions.request,
                specsDir: validatedOptions.specsDir,
                templates,
                useInteractiveMode: validatedOptions.useInteractiveMode,
            });
        }

        const shouldInitCustomRequest = await confirmDialog({
            message: 'Would you like to create a file with a custom request processing option?',
            initial: false,
        });

        if (shouldInitCustomRequest) {
            await initCustomRequest({
                templates,
                useCancelableRequest: validatedOptions?.useCancelableRequest,
                customRequestPath: validatedOptions.request,
                useInteractiveMode: validatedOptions.useInteractiveMode,
            });
        }
    } else {
        await initConfig({
            openapiConfig: validatedOptions.openapiConfig,
            request: validatedOptions.request,
            specsDir: validatedOptions.specsDir,
            templates,
            useInteractiveMode: validatedOptions.useInteractiveMode,
        });
        await initCustomRequest({
            templates,
            useCancelableRequest: validatedOptions?.useCancelableRequest,
            customRequestPath: validatedOptions.request,
            useInteractiveMode: validatedOptions.useInteractiveMode,
        });
    }
}
