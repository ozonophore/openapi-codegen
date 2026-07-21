import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { ClientArtifacts } from '../types/base/ClientArtifacts.model';
import { WriteClient } from '../WriteClient';

/**
 * Generate the OpenAPI client index file using the Handlebar template and write it to disk.
 * The index file just contains all the exports you need to use the client as a standalone
 * library. But yuo can also import individual models and services directly.
 */
export async function writeClientFullIndex(this: WriteClient, options: ClientArtifacts): Promise<void> {
    const { templates, outputPath, core, models, schemas, services, modelsMode, modelsLayout, modelsPackage } = options;
    const resolvePathIndex = resolveHelper(outputPath, 'index.ts');

    this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.INDEX_DATA_WRITTEN(resolvePathIndex));

    await this.writeOutputFile(
        resolvePathIndex,
        templates.indexes.full({
            core,
            models,
            schemas,
            services,
            modelsMode,
            modelsLayout,
            modelsPackage,
        })
    );

    this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.INDEX_WRITE_COMPLETED(resolvePathIndex));
}
