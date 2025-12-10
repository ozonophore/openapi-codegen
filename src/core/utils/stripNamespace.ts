import { basename, extname } from 'path';

import { dirNameHelper, joinHelper } from '../../common/utils/pathHelpers';
import { getClassName } from './getClassName';
import { hasMappedType } from './getMappedType';

/**
 * Strip (OpenAPI) namespaces fom values.
 * @param value
 */
export function stripNamespace(value: string): string {
    if (!value || hasMappedType(value)) {
        return value;
    }
    if (!value.match(/^(http:\/\/|https:\/\/|#\/)/g) && !hasMappedType(value) && !value.match(/^array\[[a-z]+\]$/g)) {
        const foundFile = value.match(/^(.*)#/);
        const directoryName = foundFile ? dirNameHelper(foundFile[1]) : dirNameHelper(value);

        const extName = extname(value);
        const baseName = extName.toLowerCase().match(/(\.json|\.yaml|\.yml)$/g) ? getClassName(basename(value, extName)) : getClassName(basename(value));
        return directoryName ? joinHelper(directoryName, baseName) : baseName;
    }
    const clearValue = value
        .trim()
        .replace(/^#\/components\/schemas\//, '')
        .replace(/^#\/components\/responses\//, '')
        .replace(/^#\/components\/parameters\//, '')
        .replace(/^#\/components\/examples\//, '')
        .replace(/^#\/components\/requestBodies\//, '')
        .replace(/^#\/components\/headers\//, '')
        .replace(/^#\/components\/securitySchemes\//, '')
        .replace(/^#\/components\/links\//, '')
        .replace(/^#\/components\/callbacks\//, '')
        .replace(/^#\/definitions\//, '')
        .replace(/^#\/parameters\//, '')
        .replace(/^#\/responses\//, '')
        .replace(/^#\/securityDefinitions\//, '');

    const directoryName = dirNameHelper(clearValue);
    const baseName = getClassName(basename(clearValue));
    return directoryName ? joinHelper(directoryName, baseName) : baseName;
}
