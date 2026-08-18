import { dirname, join } from 'path';

import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { resolveHelper } from '../../common/utils/pathHelpers';
import type { CoreOutputAdapter } from '../CoreOutputAdapter';
import { computeStoreRelativeImport } from './computeStoreRelativeImport';
import { isRequestSensitiveCorePath } from './coreTransportFingerprint';
import { ReuseStore } from './ReuseStore';
import type { SharedFolderWriter } from './SharedFolderWriter';
import { SHARED_FOLDER_NAME } from './SharedFolderWriter';

export type WriteSharedCoreResult = 'shared' | 'local' | 'conflict-local';

export type WriteSharedOrLocalCoreFileOptions = {
    sharedFolderWriter?: SharedFolderWriter;
    outputCorePath: string;
    relativeCorePath: string;
    content: string;
    /** Required for request-sensitive paths when sharing; ignored otherwise. */
    transportFingerprint?: string;
};

/**
 * Writes a core file either as a local full module, or as
 * `{LCA}/__shared__/core/{rel}` + stub under the item `outputCore`.
 * On content/fingerprint conflict with an existing shared entry, keeps a full local file.
 */
export async function writeSharedOrLocalCoreFile(adapter: CoreOutputAdapter, options: WriteSharedOrLocalCoreFileOptions): Promise<WriteSharedCoreResult> {
    const { sharedFolderWriter, outputCorePath, relativeCorePath, content, transportFingerprint } = options;
    const localPath = resolveHelper(outputCorePath, relativeCorePath);

    if (!sharedFolderWriter) {
        await adapter.writeOutputFile(localPath, content);
        return 'local';
    }

    const contentHash = ReuseStore.hashContent(content);
    const existing = sharedFolderWriter.getCoreEntry(relativeCorePath);
    const sensitive = isRequestSensitiveCorePath(relativeCorePath);

    if (existing) {
        const fingerprintMismatch = sensitive && existing.transportFingerprint !== transportFingerprint;
        const hashMismatch = existing.contentHash !== contentHash;
        if (fingerprintMismatch || hashMismatch) {
            adapter.logger.warn(LOGGER_MESSAGES.GENERATION.SHARED_CORE_CONTENT_CONFLICT(relativeCorePath));
            await adapter.writeOutputFile(localPath, content);
            return 'conflict-local';
        }
    } else {
        sharedFolderWriter.setCoreEntry(relativeCorePath, {
            contentHash,
            transportFingerprint: sensitive ? transportFingerprint : undefined,
        });
    }

    const canonicalPath = join(sharedFolderWriter.lca, SHARED_FOLDER_NAME, 'core', relativeCorePath);
    await fileSystemHelpers.mkdir(dirname(canonicalPath));
    const stubImport = computeStoreRelativeImport(localPath, canonicalPath);
    const stubContent = `export * from '${stubImport}';\n`;
    await adapter.writeOutputFile(canonicalPath, content);
    await adapter.writeOutputFile(localPath, stubContent);
    return 'shared';
}
