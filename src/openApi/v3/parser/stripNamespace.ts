import { basename, extname } from 'path';

import { dirName, join } from '../../../core/path';
import { getClassName } from '../../../utils/getClassName';
import { hasMappedType } from './getMappedType';

/**
 * Strip (OpenAPI) namespaces fom values.
 * @param value
 */
export function stripNamespace(value: string): string {
    if (!value.match(/^(http:\/\/|https:\/\/|#\/)/g) && !hasMappedType(value) && !value.match(/^array\[[a-z]+\]$/g)) {
        const directoryName = dirName(value);
        const extName = extname(value);
        const baseName = extName.toLowerCase().match(/(\.json|\.yaml|\/yml)$/g) ? getClassName(basename(value, extName)) : getClassName(basename(value));
        return directoryName ? join(directoryName, baseName) : baseName;
    }
    return value
        .trim()
        .replace(/^#\/components\/schemas\//, '')
        .replace(/^#\/components\/responses\//, '')
        .replace(/^#\/components\/parameters\//, '')
        .replace(/^#\/components\/examples\//, '')
        .replace(/^#\/components\/requestBodies\//, '')
        .replace(/^#\/components\/headers\//, '')
        .replace(/^#\/components\/securitySchemes\//, '')
        .replace(/^#\/components\/links\//, '')
        .replace(/^#\/components\/callbacks\//, '');
}
