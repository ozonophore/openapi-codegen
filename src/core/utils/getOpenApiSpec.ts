import SwaggerParser from '@apidevtools/swagger-parser';

import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { Context } from '../Context';
import { CommonOpenApi } from '../types/shared/CommonOpenApi.model';
import { OpenApiReference } from '../types/shared/OpenApiReference.model';
import { normalizeAllRefs } from './normalizeAllRefs';

/**
 * Load and parse te open api spec. If the file extension is ".yml" or ".yaml"
 * we will try to parse the file as a YAML spec, otherwise we will fallback
 * on parsing the file as JSON.
 * @param input
 */
export async function getOpenApiSpec(context: Context, input: string): Promise<CommonOpenApi> {
    const absoluteInput = resolveHelper(process.cwd(), input);

    if (!input) {
        throw new Error(`Could not find OpenApi spec: "${absoluteInput}"`);
    }
    const fileExists = await fileSystemHelpers.exists(absoluteInput);
    if (!fileExists) {
        throw new Error(`Could not read OpenApi spec: "${absoluteInput}"`);
    }

    // const isValidated = await SwaggerParser.validate(absoluteInput)

    const resolvedRefs = await (SwaggerParser as any).resolve(absoluteInput, { validate: false });

    // Coerce to the loose interface expected by Context
    context.addRefs(resolvedRefs);

    const raw = resolvedRefs.get(absoluteInput);
    if (!raw || typeof raw !== 'object' || Array.isArray(raw) || !('paths' in raw)) {
        throw new Error(`Schema at "${absoluteInput}" is not a valid OpenAPI object`);
    }
    const mainSchema = raw as unknown as CommonOpenApi;

    // Normalize all $ref in the entire schema using the new comprehensive resolver
    const normalizedSchema = normalizeAllRefs(mainSchema as unknown as OpenApiReference, context, absoluteInput) as CommonOpenApi;

    // The schema is already fully normalized, so we can return it directly
    return normalizedSchema;
}
