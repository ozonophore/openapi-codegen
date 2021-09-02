import RefParser from 'json-schema-ref-parser';
import path from 'path';

import { getClassName } from './getClassName';

function replaceRef(obj: any, rootPath: string, refRoot: string, refs: any) {
    for (const key of Object.keys(obj)) {
        if (key === '$ref') {
            const absolutePath = path.resolve(refRoot, obj.$ref);
            const className = getClassName(absolutePath.substring(rootPath.length, absolutePath.length - path.extname(absolutePath).length));
            if (refs.hasOwnProperty(absolutePath)) {
                obj.$ref = `#/components/schemas/${className}`;
            }
        } else if (obj[key] instanceof Object) {
            replaceRef(obj[key], rootPath, refRoot, refs);
        }
    }
}

/**
 * Load and parse te open api spec. If the file extension is ".yml" or ".yaml"
 * we will try to parse the file as a YAML spec, otherwise we will fallback
 * on parsing the file as JSON.
 * @param input
 */
export async function getOpenApiSpec(input: string): Promise<any> {
    const parser = new RefParser();
    await parser.resolve(input);
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
        const value = values[key];
        replaceRef(value, rootPath, refRootPath, values);
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
    return parser.bundle(result);
}
