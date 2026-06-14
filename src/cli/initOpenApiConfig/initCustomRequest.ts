import path from 'path';

import { APP_LOGGER } from '../../common/Consts';
import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { format } from '../../common/utils/format';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { confirmDialog } from '../interactive/confirmDialog';
import { selectDialog } from '../interactive/selectDialog';
import { CLITemplates, RequestScaffoldFormat } from './Types';

type InitCustomRequestParams = {
    templates: CLITemplates;
    useCancelableRequest?: boolean;
    customRequestPath?: string;
    useInteractiveMode?: boolean;
    requestFormat?: RequestScaffoldFormat;
};

async function resolveRequestFormat(params: InitCustomRequestParams): Promise<RequestScaffoldFormat | null> {
    if (!params.customRequestPath) {
        return null;
    }

    if (params.requestFormat) {
        return params.requestFormat;
    }

    if (params.useInteractiveMode) {
        const choice = await selectDialog<RequestScaffoldFormat>({
            message: 'Which custom HTTP scaffold format do you want?',
            choices: [
                { name: 'Legacy transport (request + requestRaw) — for "request" config', value: 'transport' },
                { name: 'createExecutorAdapter — for "customExecutorPath" config', value: 'adapter' },
                { name: 'RequestExecutor object — for direct service injection', value: 'executor' },
            ],
            initial: 0,
        });

        return choice;
    }

    return 'transport';
}

export async function initCustomRequest(params: InitCustomRequestParams): Promise<RequestScaffoldFormat | null> {
    const { templates, useCancelableRequest, customRequestPath, useInteractiveMode } = params;

    if (!customRequestPath) {
        APP_LOGGER.warn(LOGGER_MESSAGES.CUSTOM_REQUEST.PATH_NOT_PROVIDED);
        return null;
    }

    const formatType = await resolveRequestFormat(params);
    if (!formatType) {
        return null;
    }

    const artifacts = {
        useCancelableRequest,
    };

    const file = resolveHelper(process.cwd(), customRequestPath);
    const fileDir = path.dirname(file);
    const fileDirExists = await fileSystemHelpers.exists(fileDir);

    if (!fileDirExists) {
        await fileSystemHelpers.mkdir(fileDir);
    }

    const isFileExists = await fileSystemHelpers.exists(file);
    if (isFileExists) {
        if (!useInteractiveMode) {
            APP_LOGGER.warn(LOGGER_MESSAGES.CUSTOM_REQUEST.FILE_EXISTS_INTERACTIVE_DISABLED(file));
            APP_LOGGER.info(LOGGER_MESSAGES.CUSTOM_REQUEST.FILE_LEFT_UNCHANGED);
            return formatType;
        }

        const shouldOverwrite = await confirmDialog({
            message: 'Custom request file already exists. Overwrite it?',
            initial: false,
        });

        if (!shouldOverwrite) {
            APP_LOGGER.info(LOGGER_MESSAGES.CUSTOM_REQUEST.FILE_LEFT_UNCHANGED);
            return formatType;
        }
    }

    const templateByFormat: Record<RequestScaffoldFormat, Handlebars.TemplateDelegate> = {
        transport: templates.request,
        executor: templates.requestExecutor,
        adapter: templates.createExecutorAdapter,
    };

    const templateResult = templateByFormat[formatType](artifacts);
    const formattedValue = await format(templateResult);
    await fileSystemHelpers.writeFile(file, formattedValue);
    APP_LOGGER.info(LOGGER_MESSAGES.CUSTOM_REQUEST.FILE_CREATED(file));

    return formatType;
}
