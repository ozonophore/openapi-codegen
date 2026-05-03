import { resolveHelper } from '../../common/utils/pathHelpers';
import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { Templates } from '../types/base/Templates.model';
import { Model } from '../types/shared/Model.model';
import { WriteClient } from '../WriteClient';

interface IOptionsProps {
    models: Model[];
    templates: Templates;
    outputSchemasPath: string;
    useSeparatedIndexes?: boolean;
}

export async function writeClientSchemasIndex(this: WriteClient, options: IOptionsProps) {
    const { models, templates, outputSchemasPath, useSeparatedIndexes } = options;

    if (!useSeparatedIndexes) {
        return;
    }
    const filePath = resolveHelper(outputSchemasPath, 'index.ts');

    this.logger.info(`Data has been written to a file: ${filePath}`);

    const content = templates.indexes.schemas({ schemas: models });
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
