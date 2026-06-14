import { OptionValues } from 'commander';

import { APP_LOGGER } from '../../common/Consts';
import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { validateZodOptions } from '../../common/Validation';
import { confirmDialog } from '../interactive/confirmDialog';
import { InitOptions, initOptionsSchema } from '../schemas';
import { CLICommandResult } from '../types';
import { initConfig } from './initConfig';
import { initCustomRequest } from './initCustomRequest';
import { RequestScaffoldFormat } from './Types';
import { registerHandlebarTemplates } from './utils/registerHandlebarTemplates';

type HttpConfigPaths = {
    request?: string;
    customExecutorPath?: string;
};

function resolveHttpConfigPaths(requestPath: string | undefined, format: RequestScaffoldFormat | null): HttpConfigPaths {
    if (!requestPath || !format) {
        return {};
    }

    switch (format) {
        case 'transport':
            return { request: requestPath };
        case 'adapter':
            return { customExecutorPath: requestPath };
        case 'executor':
            return {};
    }
}

/**
 * Фнукция изначальной настройки файлов конфигурации для последующего запуска генератора
 */
export async function init(options: OptionValues): Promise<CLICommandResult> {
    const validationResult = validateZodOptions(initOptionsSchema, options);

    if (!validationResult.success) {
        APP_LOGGER.error(LOGGER_MESSAGES.ERROR.GENERIC(validationResult.errors.join('\n')));
        await APP_LOGGER.shutdownLoggerAsync();
        return { success: false, error: validationResult.errors.join('\n') };
    }

    const validatedOptions = validationResult.data as InitOptions;

    const templates = registerHandlebarTemplates();

    let scaffoldFormat: RequestScaffoldFormat | null = null;

    if (validatedOptions.useInteractiveMode) {
        const shouldInitConfig = await confirmDialog({
            message: 'Would you like to create a configuration file for quick start of the generator?',
            initial: false,
        });
        if (shouldInitConfig) {
            scaffoldFormat = validatedOptions.request
                ? await initCustomRequest({
                      templates,
                      useCancelableRequest: validatedOptions?.useCancelableRequest,
                      customRequestPath: validatedOptions.request,
                      useInteractiveMode: validatedOptions.useInteractiveMode,
                      requestFormat: validatedOptions.requestFormat,
                  })
                : null;

            await initConfig({
                openapiConfig: validatedOptions.openapiConfig,
                specsDir: validatedOptions.specsDir,
                templates,
                useInteractiveMode: validatedOptions.useInteractiveMode,
                httpConfig: resolveHttpConfigPaths(validatedOptions.request, scaffoldFormat),
            });
        } else {
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
                    requestFormat: validatedOptions.requestFormat,
                });
            }
        }
    } else {
        scaffoldFormat = validatedOptions.request
            ? await initCustomRequest({
                  templates,
                  useCancelableRequest: validatedOptions?.useCancelableRequest,
                  customRequestPath: validatedOptions.request,
                  useInteractiveMode: validatedOptions.useInteractiveMode,
                  requestFormat: validatedOptions.requestFormat,
              })
            : null;

        await initConfig({
            openapiConfig: validatedOptions.openapiConfig,
            request: validatedOptions.request,
            specsDir: validatedOptions.specsDir,
            templates,
            useInteractiveMode: validatedOptions.useInteractiveMode,
            httpConfig: resolveHttpConfigPaths(validatedOptions.request, scaffoldFormat),
        });
    }

    await APP_LOGGER.shutdownLoggerAsync();
    return { success: true };
}
