import type { WriteClient } from '../WriteClient';

export const SHARED_FOLDER_NAME = '__shared__';

export type SharedCoreEntry = {
    contentHash: string;
    transportFingerprint?: string;
};

/** Holds the LCA path used for auto-group canonical placement.
 *  Model writing is inline in reuseWriterHelpers.ts; core uses writeSharedCoreFile + this registry. */
export class SharedFolderWriter {
    readonly lca: string;
    private readonly coreEntries = new Map<string, SharedCoreEntry>();

    constructor(
        private readonly writeClient: WriteClient,
        lca: string
    ) {
        this.lca = lca;
    }

    getCoreEntry(relativeCorePath: string): SharedCoreEntry | undefined {
        return this.coreEntries.get(relativeCorePath);
    }

    setCoreEntry(relativeCorePath: string, entry: SharedCoreEntry): void {
        this.coreEntries.set(relativeCorePath, entry);
    }
}
