import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { resolveHelper } from '../../common/utils/pathHelpers';
import type { CoreOutputAdapter } from '../CoreOutputAdapter';
import { ClientArtifacts } from '../types/base/ClientArtifacts.model';

/**
 * Generate the OpenAPI client index file using the Handlebar template and write it to disk.
 * The index file just contains all the exports you need to use the client as a standalone
 * library. But yuo can also import individual models and services directly.
 */
export async function writeClientFullIndex(adapter: CoreOutputAdapter, options: ClientArtifacts): Promise<void> {
    const { templates, outputPath, core, models, schemas, services, modelsMode, modelsLayout, modelsPackage } = options;
    const resolvePathIndex = resolveHelper(outputPath, 'index.ts');

    adapter.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.INDEX_DATA_WRITTEN(resolvePathIndex));

    await adapter.writeOutputFile(
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

    adapter.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.INDEX_WRITE_COMPLETED(resolvePathIndex));
}
