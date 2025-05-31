import { normalize, resolve } from '../core/path';

/**
 * Converts the path to an absolute one and normalizes it.
 * @* @param path Value is the value of the path to convert.
 */
export function normalizedAbsolutePath(pathValue: string) {
    const absolute = resolve(pathValue);

    return normalize(absolute);
}
