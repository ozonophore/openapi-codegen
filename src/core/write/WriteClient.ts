import { ELogLevel, ELogOutput } from '../../common/Enums';
import { Logger } from '../../common/Logger';
import { type CoreOutputAdapter, toCoreOutputAdapter } from '../CoreOutputAdapter';
import { IndexCombineSession } from '../IndexCombineSession';
import { LintTargetRegistry } from '../LintTargetRegistry';
import { OutputFileSession } from '../OutputFileSession';
import { WriteFileIfChangedResult } from '../utils/writeFileIfChanged';
import { type TWriteClientProps, writeClientArtifacts } from './writeClientArtifacts';

/**
 * Thin facade over OutputFileSession, LintTargetRegistry, and IndexCombineSession.
 * Per-item write order lives in writeClientArtifacts; combine* flushes via CoreOutputAdapter.
 * Leaf writers are free functions — call with `toCoreOutputAdapter()`, not methods on this class.
 */
export class WriteClient {
    private readonly outputFiles: OutputFileSession;
    private readonly lintTargets: LintTargetRegistry;
    private readonly indexCombine: IndexCombineSession;
    private _logger: Logger;

    /**
     * @param [logger] логгер записи клиента
     */
    constructor(logger?: Logger) {
        this._logger =
            logger ||
            new Logger({
                level: ELogLevel.ERROR,
                instanceId: 'client',
                logOutput: ELogOutput.CONSOLE,
            });
        this.outputFiles = new OutputFileSession();
        this.lintTargets = new LintTargetRegistry();
        this.indexCombine = new IndexCombineSession();
    }

    /**
     * Записывает OpenAPI-клиент по шаблонам в выходные директории.
     * @param options параметры записи клиента
     * @returns пути, зарегистрированные этим вызовом (expected-files set-diff)
     */
    async writeClient(options: TWriteClientProps): Promise<string[]> {
        return writeClientArtifacts(this.toCoreOutputAdapter(), this.indexCombine, options, {
            getExpectedOutputFilesArray: () => this.getExpectedOutputFilesArray(),
        });
    }

    /** Собирает и записывает полный index клиента. */
    async combineAndWrite() {
        await this.indexCombine.combineAndWrite(this.toCoreOutputAdapter());
    }

    /** Собирает и записывает упрощённый index клиента. */
    async combineAndWrightSimple() {
        await this.indexCombine.combineAndWrightSimple(this.toCoreOutputAdapter());
    }

    /** Логгер записи клиента. */
    public get logger() {
        return this._logger;
    }

    public async writeOutputFile(filePath: string, content: string): Promise<WriteFileIfChangedResult> {
        return this.outputFiles.writeOutputFile(filePath, content);
    }

    public registerOutputFile(filePath: string): void {
        this.outputFiles.registerOutputFile(filePath);
    }

    public getExpectedOutputFiles(): Set<string> {
        return this.outputFiles.getExpectedOutputFiles();
    }

    public getExpectedOutputFilesArray(): string[] {
        return this.outputFiles.getExpectedOutputFilesArray();
    }

    public getWriteStats(): { written: number; unchanged: number } {
        return this.outputFiles.getWriteStats();
    }

    public registerLintTarget(filePath: string, outputRoot: string): void {
        this.lintTargets.registerLintTarget(filePath, outputRoot);
    }

    public getLintTargets(): { files: string[]; includeGlobs: string[] } {
        return this.lintTargets.getLintTargets();
    }

    public clearLintTargets(): void {
        this.lintTargets.clearLintTargets();
    }

    /** Narrow write/lint/log seam for leaf utils (no class leak). */
    public toCoreOutputAdapter(): CoreOutputAdapter {
        return toCoreOutputAdapter(this);
    }
}
