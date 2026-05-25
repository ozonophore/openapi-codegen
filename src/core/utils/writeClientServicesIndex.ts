import { resolveHelper } from '../../common/utils/pathHelpers';
import { Templates } from '../types/base/Templates.model';
import { Service } from '../types/shared/Service.model';
import { WriteClient } from '../WriteClient';
import { appendUniqueLinesToFile } from './appendUniqueLinesToFile';

interface IOptionsProps {
    services: Service[];
    templates: Templates;
    outputServices: string;
    useSeparatedIndexes?: boolean;
}

export async function writeClientServicesIndex(this: WriteClient, options: IOptionsProps) {
    const { services, templates, outputServices, useSeparatedIndexes } = options;

    if (!useSeparatedIndexes) {
        return;
    }
    const filePath = resolveHelper(outputServices, 'index.ts');

    this.logger.info(`Data has been written to a file: ${filePath}`);

    const content = templates.indexes.services({ services });
    await appendUniqueLinesToFile(filePath, content);

    this.logger.info(`Writing to the file is completed: ${filePath}`);
}
