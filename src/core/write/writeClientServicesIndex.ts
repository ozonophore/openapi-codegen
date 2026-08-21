import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { resolveHelper } from '../../common/utils/pathHelpers';
import type { CoreOutputAdapter } from '../CoreOutputAdapter';
import { Templates } from '../types/base/Templates.model';
import { Service } from '../types/shared/Service.model';

interface IOptionsProps {
    services: Service[];
    templates: Templates;
    outputServices: string;
    useSeparatedIndexes?: boolean;
}

export async function writeClientServicesIndex(adapter: CoreOutputAdapter, options: IOptionsProps) {
    const { services, templates, outputServices, useSeparatedIndexes } = options;

    if (!useSeparatedIndexes) {
        return;
    }
    const filePath = resolveHelper(outputServices, 'index.ts');

    adapter.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.INDEX_DATA_WRITTEN(filePath));

    const content = templates.indexes.services({ services });
    let existingContent = '';
    const fileExists = await fileSystemHelpers.exists(filePath);
    if (fileExists) {
        existingContent = await fileSystemHelpers.readFile(filePath, 'utf8');
    }
    const existingLines = existingContent.split(/\r?\n/).filter(Boolean);
    const dataLines = content.split(/\r?\n/).filter(Boolean);
    const linesToAdd = dataLines.filter(line => !existingLines.includes(line.trim()));
    const updatedContent = linesToAdd.length > 0 ? existingContent + linesToAdd.join('\n') + '\n' : existingContent;
    await adapter.writeOutputFile(filePath, updatedContent);

    adapter.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.INDEX_WRITE_COMPLETED(filePath));
}
