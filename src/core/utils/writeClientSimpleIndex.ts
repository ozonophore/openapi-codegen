import { resolveHelper } from '../../common/utils/pathHelpers';
import { SimpleClientArtifacts } from '../types/base/SimpleClientArtifacts.model';
import { WriteClient } from '../WriteClient';
import { fileSystem } from './fileSystem';

/**
 * Generate the OpenAPI client index file using the Handlebar template and write it to disk.
 * The index file just contains all the exports you need to use the client as a standalone
 * library. But yuo can also import individual models and services directly.
 */
export async function writeClientSimpleIndex(this: WriteClient, options: SimpleClientArtifacts): Promise<void> {
    const { templates, outputPath, core, models, schemas, services } = options;
    const resolvePathIndex = resolveHelper(outputPath, 'index.ts');

    this.logger.info(`The recording of the file data begins: ${resolvePathIndex}`);

    await fileSystem.writeFile(
        resolvePathIndex,
        templates.indexes.simple({
            core,
            models,
            schemas,
            services,
        })
    );

    this.logger.info(`File recording completed: ${resolvePathIndex}`);
}
