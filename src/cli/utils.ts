import figlet from "figlet";

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

/**
 * Returns the stylized package name to display in the terminal
 * @param appName Package name
 */
export function getCLIName(appName: string) {
    const name = figlet.textSync(appName, {
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 75,
        whitespaceBreak: true,
    });

    return `
    
    ${name}
    
    `;
}
