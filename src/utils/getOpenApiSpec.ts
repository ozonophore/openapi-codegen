import RefParser from 'json-schema-ref-parser';
import { isAbsolute } from 'path';

import { CommonOpenApi } from '../core/CommonOpenApi';
import { Context } from '../core/Context';
import { dirName, join, resolve } from '../core/path';
import { OpenApiReference } from '../openApi/interfaces/OpenApiReference';
import { exists } from './fileSystem';

function replaceRef<T>(object: OpenApiReference, context: Context, parentRef: string): T {
    if (object.$ref && !isAbsolute(object.$ref) && !object.$ref.match(/^(http:\/\/|https:\/\/|#\/)/g)) {
        object.$ref = join(parentRef, object.$ref);
    } else {
        for (const key of Object.keys(object)) {
            // @ts-ignore
            if (object[key] instanceof Object) {
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
export async function getOpenApiSpec(context: Context, input: string): Promise<any> {
    const absoluteInput = resolve(process.cwd(), input);
    if (!input) {
        throw new Error(`Could not find OpenApi spec: "${absoluteInput}"`);
    }
    const fileExists = await exists(absoluteInput);
    if (!fileExists) {
        throw new Error(`Could not read OpenApi spec: "${absoluteInput}"`);
    }
    const parser = new RefParser();
    context.addRefs(await parser.resolve(input));
    const openApi = { ...parser.schema } as CommonOpenApi;
    let newPaths = {};
    // If paths contain $ref then they must be changed to object
    for (const pathValue of Object.entries(openApi.paths)) {
        const key = pathValue[0];
        const object = pathValue[1] as OpenApiReference;
        if (object.$ref) {
            let objectValue = context.get(object.$ref);
            objectValue = replaceRef(objectValue as OpenApiReference, context, dirName(object.$ref));
            newPaths = Object.assign(newPaths, { [key]: objectValue });
        } else {
            Object.assign(newPaths, { [key]: object });
        }
    }
    parser.schema = Object.assign(parser.schema, { paths: newPaths });
    return new Promise(resolve => resolve(parser.schema));
}
