import { resolveHelper } from '../../common/utils/pathHelpers';
import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { Templates } from '../types/base/Templates.model';
import { WriteClient } from '../WriteClient';

interface IOptionsProps {
    templates: Templates;
    outputCorePath: string;
    useCancelableRequest?: boolean;
    useSeparatedIndexes?: boolean;
    modelsMode?: import('../types/enums/ModelsMode.enum').ModelsMode;
}

export async function writeClientCoreIndex(this: WriteClient, options: IOptionsProps) {
    const { templates, outputCorePath, useCancelableRequest, useSeparatedIndexes, modelsMode } = options;

    if (!useSeparatedIndexes) {
        return;
    }
    const filePath = resolveHelper(outputCorePath, 'index.ts');

    this.logger.info(`Data has been written to a file: ${filePath}`);

    const content = templates.indexes.core({ useCancelableRequest, modelsMode });
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

    this.logger.info(`Writing to the file is completed: ${filePath}`);
}
