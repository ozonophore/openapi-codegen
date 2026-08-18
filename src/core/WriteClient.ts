import { ELogLevel, ELogOutput } from '../common/Enums';
import { Logger } from '../common/Logger';
import { type CoreOutputAdapter, toCoreOutputAdapter } from './CoreOutputAdapter';
import { IndexCombineSession } from './IndexCombineSession';
import { LintTargetRegistry } from './LintTargetRegistry';
import { OutputFileSession } from './OutputFileSession';
import { writeClientCore } from './utils/writeClientCore';
import { writeClientCoreIndex } from './utils/writeClientCoreIndex';
import { writeClientExecutor } from './utils/writeClientExecutor';
import { writeClientFullIndex } from './utils/writeClientFullIndex';
import { writeClientModels } from './utils/writeClientModels';
import { writeClientModelsIndex } from './utils/writeClientModelsIndex';
import { writeClientSchemas } from './utils/writeClientSchemas';
import { writeClientSchemasIndex } from './utils/writeClientSchemasIndex';
import { writeClientServices } from './utils/writeClientServices';
import { writeClientServicesIndex } from './utils/writeClientServicesIndex';
import { writeClientSimpleIndex } from './utils/writeClientSimpleIndex';
import { WriteFileIfChangedResult } from './utils/writeFileIfChanged';
import { type TWriteClientProps, writeClientArtifacts } from './writeClientArtifacts';

/**
 * Thin facade over OutputFileSession, LintTargetRegistry, and IndexCombineSession.
 * Per-item write order lives in writeClientArtifacts; leaf writeClient* bindings remain for IndexCombine/tests.
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
     */
    async writeClient(options: TWriteClientProps): Promise<void> {
        await writeClientArtifacts(this.toCoreOutputAdapter(), this.indexCombine, options);
    }

    /** Собирает и записывает полный index клиента. */
    async combineAndWrite() {
        await this.indexCombine.combineAndWrite(this);
    }

    /** Собирает и записывает упрощённый index клиента. */
    async combineAndWrightSimple() {
        await this.indexCombine.combineAndWrightSimple(this);
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

    /** Делегирует запись core-части клиента. */
    public writeClientCore = (options: Parameters<typeof writeClientCore>[1]) => writeClientCore(this.toCoreOutputAdapter(), options);
    /** Делегирует запись index core-части. */
    public writeClientCoreIndex = (options: Parameters<typeof writeClientCoreIndex>[1]) => writeClientCoreIndex(this.toCoreOutputAdapter(), options);
    /** Делегирует запись полного index клиента. */
    public writeClientFullIndex = (options: Parameters<typeof writeClientFullIndex>[1]) => writeClientFullIndex(this.toCoreOutputAdapter(), options);
    /** Делегирует запись моделей клиента. */
    public writeClientModels = (options: Parameters<typeof writeClientModels>[1]) => writeClientModels(this.toCoreOutputAdapter(), options);
    /** Делегирует запись index моделей. */
    public writeClientModelsIndex = (options: Parameters<typeof writeClientModelsIndex>[1]) => writeClientModelsIndex(this.toCoreOutputAdapter(), options);
    /** Делегирует запись схем клиента. */
    public writeClientSchemas = (options: Parameters<typeof writeClientSchemas>[1]) => writeClientSchemas(this.toCoreOutputAdapter(), options);
    /** Делегирует запись index схем. */
    public writeClientSchemasIndex = (options: Parameters<typeof writeClientSchemasIndex>[1]) => writeClientSchemasIndex(this.toCoreOutputAdapter(), options);
    /** Делегирует запись сервисов клиента. */
    public writeClientServices = (options: Parameters<typeof writeClientServices>[1]) => writeClientServices(this.toCoreOutputAdapter(), options);
    /** Делегирует запись index сервисов. */
    public writeClientServicesIndex = (options: Parameters<typeof writeClientServicesIndex>[1]) => writeClientServicesIndex(this.toCoreOutputAdapter(), options);
    /** Делегирует запись упрощённого index клиента. */
    public writeClientSimpleIndex = (options: Parameters<typeof writeClientSimpleIndex>[1]) => writeClientSimpleIndex(this.toCoreOutputAdapter(), options);
    /** Делегирует запись executor клиента. */
    public writeClientExecutor = (options: Parameters<typeof writeClientExecutor>[1]) => writeClientExecutor(this.toCoreOutputAdapter(), options);
}
