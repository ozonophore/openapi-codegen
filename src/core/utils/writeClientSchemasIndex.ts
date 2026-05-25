import { resolveHelper } from '../../common/utils/pathHelpers';
import { Templates } from '../types/base/Templates.model';
import { Model } from '../types/shared/Model.model';
import { WriteClient } from '../WriteClient';
import { appendUniqueLinesToFile } from './appendUniqueLinesToFile';

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
    await appendUniqueLinesToFile(filePath, content);

    this.logger.info(`Writing to the file is completed: ${filePath}`);
}
