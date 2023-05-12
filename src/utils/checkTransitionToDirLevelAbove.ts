/**
 * The function checks the transition to the directory with a level above and normalizes the path.
 * Input: "../../etc/abc"
 * Output: "etc/abc"
 */
export function replaceTransitionToDirLevelAbove(path: string): string {
    const anotherDirRegexp = /^(?:\.{2})?(?:\/\.{2})*\//;
    return path.replace(anotherDirRegexp, '');
}
