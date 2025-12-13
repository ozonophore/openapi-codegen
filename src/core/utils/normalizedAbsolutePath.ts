import { normalizeHelper, resolveHelper } from '../../common/utils/pathHelpers';

/**
 * Converts the path to an absolute one and normalizes it.
 * @* @param path Value is the value of the path to convert.
 */
export function normalizedAbsolutePath(pathValue: string) {
    const absolute = resolveHelper(pathValue);

    return normalizeHelper(absolute);
}
