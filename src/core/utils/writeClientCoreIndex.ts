import { resolveHelper } from '../../common/utils/pathHelpers';
import { Templates } from '../types/base/Templates.model';
import { WriteClient } from '../WriteClient';
import { appendUniqueLinesToFile } from './appendUniqueLinesToFile';

interface IOptionsProps {
    templates: Templates;
    outputCorePath: string;
    useCancelableRequest?: boolean;
    useSeparatedIndexes?: boolean;
}

export async function writeClientCoreIndex(this: WriteClient, options: IOptionsProps) {
    const { templates, outputCorePath, useCancelableRequest, useSeparatedIndexes } = options;

    if (!useSeparatedIndexes) {
        return;
    }
    const filePath = resolveHelper(outputCorePath, 'index.ts');

    this.logger.info(`Data has been written to a file: ${filePath}`);

    const content = templates.indexes.core({ useCancelableRequest});
    await appendUniqueLinesToFile(filePath, content);

    this.logger.info(`Writing to the file is completed: ${filePath}`);
}