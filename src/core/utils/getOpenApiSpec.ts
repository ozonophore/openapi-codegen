import SwaggerParser from '@apidevtools/swagger-parser';

import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { dirNameHelper, resolveHelper } from '../../common/utils/pathHelpers';
import { Context } from '../Context';
import { CommonOpenApi } from '../types/shared/CommonOpenApi.model';

export async function getOpenApiSpec(context: Context, input: string): Promise<CommonOpenApi> {
    const absoluteInput = resolveHelper(process.cwd(), input);

    if (!input) {
        throw new Error(`OpenAPI spec path is empty`);
    }

    const exists = await fileSystemHelpers.exists(absoluteInput);
    if (!exists) {
        throw new Error(`OpenAPI spec not found: ${absoluteInput}`);
    }

    const parser = new SwaggerParser();
    const previousCwd = process.cwd();
    const inputDir = dirNameHelper(absoluteInput);
    if (previousCwd !== inputDir) {
        process.chdir(inputDir);
    }
    let resolved;
    try {
        resolved = await parser.resolve(absoluteInput);
    } finally {
        if (process.cwd() !== previousCwd) {
            process.chdir(previousCwd);
        }
    }
    context.addRefs(resolved);
    
    // Получить основную схему
    const raw = resolved.get(absoluteInput);
    if (!raw || typeof raw !== 'object') {
        throw new Error(`Invalid OpenAPI schema at ${absoluteInput}`);
    }

    context.initializeVirtualFileMap(raw, absoluteInput);

    return raw as unknown as CommonOpenApi;
}
