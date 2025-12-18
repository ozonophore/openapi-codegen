import { resolveHelper } from '../../common/utils/pathHelpers';
import { ClientArtifacts } from '../types/base/ClientArtifacts.model';
import { WriteClient } from '../WriteClient';
import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';

/**
 * Generate the OpenAPI client index file using the Handlebar template and write it to disk.
 * The index file just contains all the exports you need to use the client as a standalone
 * library. But yuo can also import individual models and services directly.
 */
export async function writeClientFullIndex(this: WriteClient, options: ClientArtifacts): Promise<void> {
    const { templates, outputPath, core, models, schemas, services } = options;
    const resolvePathIndex = resolveHelper(outputPath, 'index.ts');

    this.logger.info(`Data has been written to a file: ${resolvePathIndex}`);

    await fileSystemHelpers.writeFile(
        resolvePathIndex,
        templates.indexes.full({
            core,
            models,
            schemas,
            services,
        })
    );

    this.logger.info(`Writing to the file is completed: ${resolvePathIndex}`);
}
