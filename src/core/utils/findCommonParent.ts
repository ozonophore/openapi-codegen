/**
 * Finds the common parent directory of two paths
 * @param path1 The value of the path
 * @param path2 The value of the path
 */
export function findCommonParent(path1: string, path2: string): string | null {
    const pathSep = '/';
    const parts1 = path1.split(pathSep).filter(Boolean);
    const parts2 = path2.split(pathSep).filter(Boolean);

    let i = 0;
    while (i < parts1.length && i < parts2.length && parts1[i] === parts2[i]) {
        i++;
    }

    if (i === 0) return null;

    return pathSep + parts1.slice(0, i).join(pathSep);
}
