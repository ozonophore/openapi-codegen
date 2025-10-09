import SwaggerParser from '@apidevtools/swagger-parser';
import { isAbsolute } from 'path';

import { Context } from '../Context';
import { CommonOpenApi } from '../types/shared/CommonOpenApi.model';
import { OpenApiReference } from '../types/shared/OpenApiReference.model';
import { dirName, join, resolve } from '../utils/pathHelpers';
import { fileSystem } from './fileSystem';

function encodeJsonPointer(pointer: string): string {
    const [base, fragment] = pointer.split('#');
    if (!fragment) {
        return pointer;
    }
    const encoded = fragment
        .split('/')
        .map(part => part.replace(/~/g, '~0').replace(/\//g, '~1'))
        .join('/');
    return `${base}#${encoded}`;
}

function replaceRef<T>(object: OpenApiReference, context: Context, parentRef: string): T {
    if (object.$ref && !isAbsolute(object.$ref) && !object.$ref.match(/^(http:\/\/|https:\/\/|#\/)/g)) {
        object.$ref = join(parentRef, object.$ref);
    } else {
        for (const key of Object.keys(object)) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (object[key] instanceof Object) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                replaceRef(object[key], context, parentRef);
            }
        }
    }
    return <T>object;
}

/**
 * Load and parse te open api spec. If the file extension is ".yml" or ".yaml"
 * we will try to parse the file as a YAML spec, otherwise we will fallback
 * on parsing the file as JSON.
 * @param input
 */
export async function getOpenApiSpec(context: Context, input: string): Promise<CommonOpenApi> {
    const absoluteInput = resolve(process.cwd(), input);

    if (!input) {
        throw new Error(`Could not find OpenApi spec: "${absoluteInput}"`);
    }
    const fileExists = await fileSystem.exists(absoluteInput);
    if (!fileExists) {
        throw new Error(`Could not read OpenApi spec: "${absoluteInput}"`);
    }

    const resolvedRefs = await (SwaggerParser as any).resolve(absoluteInput, { validate: false });

    // Coerce to the loose interface expected by Context
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    context.addRefs(resolvedRefs);

    const raw = resolvedRefs.get(absoluteInput);
    if (!raw || typeof raw !== 'object' || Array.isArray(raw) || !('paths' in raw)) {
        throw new Error(`Schema at "${absoluteInput}" is not a valid OpenAPI object`);
    }
    const mainSchema = raw as unknown as CommonOpenApi;

    const newPaths: Record<string, any> = {};

    for (const [pathKey, value] of Object.entries(mainSchema.paths)) {
        const maybeRef = value as OpenApiReference;
        if (maybeRef.$ref) {
            const encodedRef = encodeJsonPointer(maybeRef.$ref);
            newPaths[pathKey] = replaceRef(context.get(encodedRef) as OpenApiReference, context, dirName(maybeRef.$ref));
        } else {
            newPaths[pathKey] = value;
        }
    }

    mainSchema.paths = newPaths;

    return mainSchema;
}
