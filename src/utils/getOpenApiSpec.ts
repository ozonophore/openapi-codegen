import RefParser from 'json-schema-ref-parser';
import path from 'path';

import { exists } from './fileSystem';
import { getClassName } from './getClassName';
import { mergeDeep } from './mergeDeep';
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
        const fileName = path.basename(key);
        const filePath = key.substring(rootPath.length, key.length - fileName.length);
        const className = path.resolve(filePath, getClassName(fileName.substring(0, fileName.length - path.extname(fileName).length)));
        let valueeObj: Record<string, any> = { ...value };
        for (const v of className.split(/\//g).filter(Boolean).reverse()) {
            valueeObj = {
                [v]: valueeObj,
            };
        }
        componentsFromFile = {
            ...componentsFromFile,
            schemas: {
                ...componentsFromFile.schemas,
                ...mergeDeep(componentsFromFile.schemas, valueeObj),
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
