import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { resolveHelper } from '../../common/utils/pathHelpers';
import type { CoreOutputAdapter } from '../CoreOutputAdapter';
import { SimpleClientArtifacts } from '../types/base/SimpleClientArtifacts.model';

/**
 * Generate the OpenAPI client index file using the Handlebar template and write it to disk.
 * The index file just contains all the exports you need to use the client as a standalone
 * library. But yuo can also import individual models and services directly.
 */
export async function writeClientSimpleIndex(adapter: CoreOutputAdapter, options: SimpleClientArtifacts): Promise<void> {
    const { templates, outputPath, core, models, schemas, services } = options;
    const resolvePathIndex = resolveHelper(outputPath, 'index.ts');

    adapter.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.DATA_WRITE_START(resolvePathIndex));

    await adapter.writeOutputFile(
        resolvePathIndex,
        templates.indexes.simple({
            core,
            models,
            schemas,
            services,
        })
    );

    adapter.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.FILE_RECORDED(resolvePathIndex));
}
