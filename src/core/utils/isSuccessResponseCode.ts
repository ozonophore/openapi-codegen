/**
 * Checks whether a response code key is an explicit successful HTTP status code.
 * Supports exact 2xx numeric codes (e.g. `200`) and OpenAPI range form (`2xx`).
 */
export function isSuccessResponseCode(responseCode: string): boolean {
    return /^\s*2\d\d\s*$/.test(responseCode) || /^\s*2xx\s*$/i.test(responseCode);
}
