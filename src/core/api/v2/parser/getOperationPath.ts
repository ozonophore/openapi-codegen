import { getOperationParameterName } from './getOperationParameterName';

/**
 * Get the final service path.
 * @param path URL.
 * @returns The correct parameter names to replace in the URL.
 */
export function getOperationPath(path: string): string {
    return path.replace(/\{(.*?)\}/g, (substring: string, w: string) => {
        return substring === '{api-version}' ? `{${w}}` : `\${${getOperationParameterName(w)}}`;
    });
}
