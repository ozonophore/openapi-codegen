import path from 'path';

import { APP_LOGGER } from '../../common/Consts';
import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { format } from '../../common/utils/format';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { confirmDialog } from '../interactive/confirmDialog';
import { CLITemplates } from './Types';

type InitCustomRequestParams = {
    templates: CLITemplates;
    useCancelableRequest?: boolean;
    customRequestPath?: string;
    useInteractiveMode?: boolean;
};

export async function initCustomRequest(params: InitCustomRequestParams): Promise<void> {
    const { templates, useCancelableRequest, customRequestPath, useInteractiveMode } = params;

    if (!customRequestPath) {
        APP_LOGGER.warn(LOGGER_MESSAGES.CUSTOM_REQUEST.PATH_NOT_PROVIDED);
        return;
    }

    const shouldRequestExecutor = useInteractiveMode
        ? await confirmDialog({
            message: 'Generate custom request file in executor format?',
            initial: false,
        })
        : false;

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
            return;
        }

        const shouldOverwrite = await confirmDialog({
            message: 'Custom request file already exists. Overwrite it?',
            initial: false,
        });

        if (!shouldOverwrite) {
            APP_LOGGER.info(LOGGER_MESSAGES.CUSTOM_REQUEST.FILE_LEFT_UNCHANGED);
            return;
        }
    }

    const templateResult = shouldRequestExecutor ? templates.requestExecutor(artifacts) : templates.request(artifacts);
    const formattedValue = await format(templateResult);
    await fileSystemHelpers.writeFile(file, formattedValue);
    APP_LOGGER.info(LOGGER_MESSAGES.CUSTOM_REQUEST.FILE_CREATED(file));
}
