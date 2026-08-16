import { COMMON_DEFAULT_OPTIONS_VALUES } from '../common/Consts';
import { Logger } from '../common/Logger';
import { extractEslintFixOptions, TEslintFixOptions } from '../common/TEslintFixOptions';
import { TRawOptions } from '../common/TRawOptions';
import { GenerationBatchSession } from './GenerationBatchSession';
import { shouldEntitySkip } from './generationCache/EntitySkip';
import { GenerationItemSession } from './GenerationItemSession';
import { normalizePathsToAbsolute, resolveGenerationOptions } from './resolveGenerationOptions';
import { WriteClient } from './write/WriteClient';

/**
 * Facade: constructs WriteClient, Generation item/batch sessions; wires generateItem.
 * Options meaning lives in resolveGenerationOptions.
 */
export class OpenApiClient {
    private _writeClient: WriteClient | null = null;
    /** ESLint paths from top-level rawOptions (not per items[] entry). */
    private eslintFixOptions: TEslintFixOptions = {};

    /** Экземпляр WriteClient для записи сгенерированных файлов. */
    public get writeClient() {
        if (!this._writeClient) {
            throw new Error('WriteClient must be initialized');
        }
        return this._writeClient;
    }

    /**
     * Запускает генерацию клиента по опциям CLI или конфигурации.
     * @param rawOptions сырые опции генерации
     */
    async generate(rawOptions: TRawOptions) {
        const logger = new Logger({
            level: rawOptions.logLevel ?? COMMON_DEFAULT_OPTIONS_VALUES.logLevel!,
            instanceId: 'client',
            logOutput: rawOptions.logTarget ?? COMMON_DEFAULT_OPTIONS_VALUES.logTarget!,
        });
        this._writeClient = new WriteClient(logger);
        this.eslintFixOptions = extractEslintFixOptions(rawOptions);

        const { items, root } = normalizePathsToAbsolute(resolveGenerationOptions(rawOptions), process.cwd());
        const itemSession = new GenerationItemSession({
            writeClient: this.writeClient,
            eslintFixOptions: this.eslintFixOptions,
        });
        const session = new GenerationBatchSession({
            writeClient: this.writeClient,
            eslintFixOptions: this.eslintFixOptions,
            generateItem: (item, generationCache, itemRunContext) => itemSession.run(item, generationCache, itemRunContext),
            shouldEntitySkip: (item, generationCache, reuseStore) => shouldEntitySkip({ item, generationCache, reuseStore }),
        });
        await session.run(items, root);
    }
}
