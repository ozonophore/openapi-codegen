import path from 'path'

import * as OpenAPI from '../core'

/**
 * Checks if `value` is `null` or `undefined`.
 *
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is nullish, else `false`.
 * @example
 *
 * isNil(null)
 * // => true
 *
 * isNil(void 0)
 * // => true
 *
 * isNil(NaN)
 * // => false
 */
export function isNil(value: any) {
    return value == null;
}

export function isValidJson(value: any) {
    try {
        JSON.parse(value);
        return true;
    } catch {
        return false;
    }
}

export function startGenerate(options: any) {
    return OpenAPI.generate(options)
        .then(() => {
            console.group(`Generation from has been finished`);
            const group = Array.isArray(options) ? options : Array.of(options);
            group.forEach(option => {
                console.log(`Generation from "${option.input}" was finished`);
                console.log(`Output folder: ${path.resolve(process.cwd(), option.output)}`);
                console.log('==================================');
            });
            console.groupEnd();
        })
        .catch((error: any) => {
            console.log(error);
            process.exit(1);
        });
}