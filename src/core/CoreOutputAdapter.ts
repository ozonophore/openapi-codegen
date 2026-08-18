import type { ReuseOutputAdapter } from './reuseStore/reuseWriterHelpers';
import type { WriteFileIfChangedResult } from './utils/writeFileIfChanged';

/** Narrow logger duck used by write leaves and shared-core. */
export type CoreOutputLogger = {
    info: (message: string) => void;
    warn: (message: string) => void;
};

/**
 * Narrow write/lint/log seam for `writeClient*` leaves and `writeSharedOrLocalCoreFile`.
 * Does not depend on the WriteClient class.
 */
export type CoreOutputAdapter = {
    writeOutputFile: (file: string, content: string) => Promise<WriteFileIfChangedResult | unknown>;
    registerLintTarget: (file: string, outputRoot: string) => void;
    logger: CoreOutputLogger;
};

export type CoreOutputAdapterHost = {
    writeOutputFile: (file: string, content: string) => Promise<WriteFileIfChangedResult | unknown>;
    registerLintTarget: (file: string, outputRoot: string) => void;
    logger: CoreOutputLogger;
};

/** Builds a CoreOutputAdapter from any host that exposes the three methods. */
export function toCoreOutputAdapter(host: CoreOutputAdapterHost): CoreOutputAdapter {
    return {
        writeOutputFile: (file, content) => host.writeOutputFile(file, content),
        registerLintTarget: (file, outputRoot) => host.registerLintTarget(file, outputRoot),
        logger: host.logger,
    };
}

/**
 * Projects CoreOutputAdapter to the narrow ReuseOutputAdapter.
 * When reuse omits outputDir, `defaultLintRoot` is used if provided.
 */
export function toReuseOutputAdapter(core: CoreOutputAdapter, defaultLintRoot?: string): ReuseOutputAdapter {
    return {
        writeOutputFile: (file, content) => core.writeOutputFile(file, content),
        registerLintTarget: (file, outputDir) => {
            const root = outputDir ?? defaultLintRoot;
            if (root === undefined) {
                return;
            }
            core.registerLintTarget(file, root);
        },
    };
}
