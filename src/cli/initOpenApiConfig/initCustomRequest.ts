import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { format } from '../../common/utils/format';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { confirmDialog } from '../interactive/confirmDialog';
import { CLITemplates } from './Types';

export async function initCustomRequest(templates: CLITemplates, useCancelableRequest?: boolean) {
    // TODO: Подумать над правильной постановкой вопроса!
    const shouldRequestExecutor = await confirmDialog({
        message: 'Желаете сформировать пользовательский обработчик request в новом формате?',
        initial: false,
    });

    const artifacts = {
        useCancelableRequest,
    };

    const customRequestPath = './src/custom/request.ts';
    const file = resolveHelper(process.cwd(), customRequestPath);
    const templateResult = shouldRequestExecutor ? templates.requestExecutor(artifacts) : templates.request(artifacts);
    const formattedValue = await format(templateResult);
    await fileSystemHelpers.writeFile(file, formattedValue);

    return;
}
