/**
 * Owns lint target files and include globs for the batch ESLint pass.
 */
export class LintTargetRegistry {
    private lintTargetFiles = new Set<string>();
    private lintIncludeGlobs = new Set<string>();

    registerLintTarget(filePath: string, outputRoot: string): void {
        this.lintTargetFiles.add(filePath);
        this.lintIncludeGlobs.add(`${outputRoot.replace(/\\/g, '/')}/**/*.ts`);
    }

    getLintTargets(): { files: string[]; includeGlobs: string[] } {
        return {
            files: [...this.lintTargetFiles],
            includeGlobs: [...this.lintIncludeGlobs],
        };
    }

    clearLintTargets(): void {
        this.lintTargetFiles.clear();
        this.lintIncludeGlobs.clear();
    }
}
