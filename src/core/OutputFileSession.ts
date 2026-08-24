import { writeFileIfChanged, WriteFileIfChangedResult } from './utils/writeFileIfChanged';

/**
 * Owns disk write, expected-file registry, and write stats.
 * `writeOutputFile` atomically writes and registers expected paths.
 */
export class OutputFileSession {
    private expectedOutputFiles: Set<string> = new Set();
    private writeStats = { written: 0, unchanged: 0 };

    async writeOutputFile(filePath: string, content: string): Promise<WriteFileIfChangedResult> {
        this.expectedOutputFiles.add(filePath);
        const result = await writeFileIfChanged(filePath, content);
        this.writeStats[result] += 1;
        return result;
    }

    registerOutputFile(filePath: string): void {
        this.expectedOutputFiles.add(filePath);
    }

    getExpectedOutputFiles(): Set<string> {
        return this.expectedOutputFiles;
    }

    getExpectedOutputFilesArray(): string[] {
        return Array.from(this.expectedOutputFiles);
    }

    getWriteStats(): { written: number; unchanged: number } {
        return { ...this.writeStats };
    }
}
