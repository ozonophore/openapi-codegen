import { JSONSchema } from '@apidevtools/json-schema-ref-parser';
import path from 'path';

import { getClassName } from './getClassName';

export function replaceRef<T extends JSONSchema>(obj: any, rootPath: string, refRoot: string, refs: any): T {
    const valueSchema = Object.assign(obj, {});
    for (const key of Object.keys(valueSchema)) {
        if (key === '$ref') {
            const absolutePath = path.resolve(refRoot, valueSchema.$ref);
            const className = getClassName(absolutePath.substring(rootPath.length, absolutePath.length - path.extname(absolutePath).length));
            if (refs.hasOwnProperty(absolutePath)) {
                obj.$ref = `#/components/schemas/${className}`;
            }
        } else if (valueSchema[key] instanceof Object) {
            replaceRef(valueSchema[key], rootPath, refRoot, refs);
        }
    }
    return valueSchema;
}
