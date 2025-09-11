import { resolve } from 'path';

import { SimpleClientArtifacts } from '../types/base/SimpleClientArtifacts.model';
import { fileSystem } from './fileSystem';

/**
 * Generate the OpenAPI client index file using the Handlebar template and write it to disk.
 * The index file just contains all the exports you need to use the client as a standalone
 * library. But yuo can also import individual models and services directly.
 * @param client: Client object, containing, models, schemas and services
 * @param templates: The loaded handlebar templates
 * @param outputPath: Directory to write the generated files to
 * @param useUnionTypes: Use union types instead of enums
 * @param exportCore: Generate core
 * @param exportServices: Generate services
 * @param exportModels: Generate models
 * @param exportSchemas: Generate schemas
 */
export async function writeClientSimpleIndex(options: SimpleClientArtifacts): Promise<void> {
    const { templates, outputPath, core, models, schemas, services } = options;
    const resolvePathIndex = resolve(outputPath, 'index.ts');
    await fileSystem.writeFile(
        resolvePathIndex,
        templates.indexes.simple({
            core,
            models,
            schemas,
            services,
        })
    );
}
