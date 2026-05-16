import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { Templates } from '../types/base/Templates.model';
import { ModelsMode } from '../types/enums/ModelsMode.enum';
import { Model } from '../types/shared/Model.model';
import { WriteClient } from '../WriteClient';

interface IOptionsProps {
    models: Model[];
    templates: Templates;
    outputModelsPath: string;
    useSeparatedIndexes?: boolean;
    modelsMode?: ModelsMode;
}

export async function writeClientModelsIndex(this: WriteClient, options: IOptionsProps) {
    const { models, templates, outputModelsPath, useSeparatedIndexes, modelsMode } = options;

    if (!useSeparatedIndexes) {
        return;
    }
    const filePath = resolveHelper(outputModelsPath, 'index.ts');

    this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.INDEX_DATA_WRITTEN(filePath));

    const content = templates.indexes.models({ models, modelsMode });
    let existingContent = '';
    const fileExists = await fileSystemHelpers.exists(filePath);
    if (fileExists) {
        existingContent = await fileSystemHelpers.readFile(filePath, 'utf8');
    }
    const existingLines = existingContent.split(/\r?\n/).filter(Boolean);
    const dataLines = content.split(/\r?\n/).filter(Boolean);
    const linesToAdd = dataLines.filter(line => !existingLines.includes(line.trim()));
    const updatedContent = linesToAdd.length > 0 ? existingContent + linesToAdd.join('\n') + '\n' : existingContent;
    await this.writeOutputFile(filePath, updatedContent);

    this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.INDEX_WRITE_COMPLETED(filePath));
}
