import { createHash } from 'crypto';
import { dirname } from 'path';

import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { resolveHelper } from '../../common/utils/pathHelpers';

type CacheEntry = {
    key: string;
    fingerprint: string;
    files: string[];
    updatedAt: number;
};

type CacheData = {
    version: number;
    entries: Record<string, CacheEntry>;
};

const CURRENT_CACHE_VERSION = 1;

export class GenerationCache {
    private readonly cachePath: string;
    private data: CacheData = { version: CURRENT_CACHE_VERSION, entries: {} };
    private readonly accessedKeys = new Set<string>();

    constructor(cachePath: string) {
        this.cachePath = resolveHelper(process.cwd(), cachePath);
    }

    static hash(value: string): string {
        return createHash('md5').update(value).digest('hex');
    }

    async load(): Promise<void> {
        const exists = await fileSystemHelpers.exists(this.cachePath);
        if (!exists) {
            return;
        }

        try {
            const raw = await fileSystemHelpers.readFile(this.cachePath, 'utf8');
            const parsed = JSON.parse(raw) as CacheData;
            if (!parsed || parsed.version !== CURRENT_CACHE_VERSION || !parsed.entries) {
                return;
            }
            this.data = parsed;
        } catch {
            // Corrupted cache file — start fresh
        }
    }

    get(key: string): CacheEntry | undefined {
        this.accessedKeys.add(key);
        return this.data.entries[key];
    }

    set(entry: CacheEntry): void {
        this.accessedKeys.add(entry.key);
        this.data.entries[entry.key] = entry;
    }

    async save(): Promise<void> {
        for (const key of Object.keys(this.data.entries)) {
            if (!this.accessedKeys.has(key)) {
                delete this.data.entries[key];
            }
        }
        await fileSystemHelpers.mkdir(dirname(this.cachePath));
        await fileSystemHelpers.writeFile(this.cachePath, JSON.stringify(this.data, null, 2));
    }
}

export type { CacheEntry };
