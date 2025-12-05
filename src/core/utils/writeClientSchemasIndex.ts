import { resolve } from 'path';

import { Model } from '../types/shared/Model.model';
import { WriteClient } from '../WriteClient';
import { appendUniqueLinesToFile } from './appendUniqueLinesToFile';
import { Templates } from './registerHandlebarTemplates';

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
    const filePath = resolve(outputSchemasPath, 'index.ts');

    this.logger.info(`Data has been written to a file: ${filePath}`);

    const content = templates.indexes.schemas({ schemas: models });
    await appendUniqueLinesToFile(filePath, content);

    this.logger.info(`Writing to the file is completed: ${filePath}`);
}
