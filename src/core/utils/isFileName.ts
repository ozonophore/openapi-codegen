/**
 * Checks if the string is just a file name (with an extension)
 * @param str - the line to check
 * @returns true, if this is the file name
 */
export function isFileName(str: string): boolean {
    if (typeof str !== 'string' || !str) return false;

    // 1. Does not contain path separators
    if (str.includes('/') || str.includes('\\')) return false;

    // 2. Does not start with ./, ../, \
    if (/^\.\.?[\\/\\]/.test(str)) return false;
    if (str.startsWith('/')) return false;

    // 3. Contains at least one dot and does not end with a dot.
    const parts = str.split('.');
    if (parts.length < 2) return false;
    if (parts[parts.length - 1] === '') return false; // ends with .

    // 4. The file name is not empty
    if (parts[0] === '') return false;

    return true;
}
