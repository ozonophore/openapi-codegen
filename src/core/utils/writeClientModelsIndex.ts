import { resolveHelper } from '../../common/utils/pathHelpers';
import { Templates } from '../types/base/Templates.model';
import { Model } from '../types/shared/Model.model';
import { WriteClient } from '../WriteClient';
import { appendUniqueLinesToFile } from './appendUniqueLinesToFile';
import { ModelsMode } from '../types/enums/ModelsMode.enum';

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

    this.logger.info(`Data has been written to a file: ${filePath}`);

    const content = templates.indexes.models({ models, modelsMode });
    await appendUniqueLinesToFile(filePath, content);

    this.logger.info(`Writing to the file is completed: ${filePath}`);
}
