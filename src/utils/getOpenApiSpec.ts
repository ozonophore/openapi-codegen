import RefParser from 'json-schema-ref-parser';
import path from 'path';

import { exists } from './fileSystem';
import { getClassName } from './getClassName';
import { replaceRef } from './replaceRef';

/**
 * Load and parse te open api spec. If the file extension is ".yml" or ".yaml"
 * we will try to parse the file as a YAML spec, otherwise we will fallback
 * on parsing the file as JSON.
 * @param input
 */
export async function getOpenApiSpec(input: string): Promise<any> {
        const filePath = path.resolve(process.cwd(), input);
    if (!input) {
        throw new Error(`Could not find OpenApi spec: "${filePath}"`);
   }
    const fileExists = await exists(filePath);
    const parser = new RefParser();
    if (fileExists) {
        await parser.resolve(input);
    } else {
        throw new Error(`Could not read OpenApi spec: "${filePath}"`);
    }
    const values = parser.$refs.values('file');
    const keys = Object.keys(values);
    const rootPath = path.dirname(keys[0]);
    let componentsFromFile = { schemas: {} };
    for (const key of keys) {
        const refRootPath = path.dirname(key);
        const value = values[key];
        if (refRootPath === rootPath) {
            continue;
        }
        const className = getClassName(key.substring(rootPath.length, key.length - path.extname(key).length));
        componentsFromFile = {
            ...componentsFromFile,
            schemas: {
                ...componentsFromFile.schemas,
                [className]: value,
            },
        };
    }
    for (const key of keys) {
        const refRootPath = path.dirname(key);
        values[key] = replaceRef(values[key], rootPath, refRootPath, values);
    }
    let result = <any>parser.schema;
    if (keys.length > 1) {
        if (result.hasOwnProperty('components')) {
            const objectComponents = result.components;
            if (objectComponents.hasOwnProperty('schemas')) {
                objectComponents.schemas = Object.assign(objectComponents.schemas, componentsFromFile.schemas);
            } else {
                result.components = Object.assign(result.components, componentsFromFile);
            }
        } else {
            result = Object.assign(result, { components: componentsFromFile });
        }
    }
    return await parser.bundle(result);
}
