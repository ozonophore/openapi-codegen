import { rename as fsRename } from 'fs';
import { dirname, join } from 'path';
import { promisify } from 'util';

import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { buildArtifactKey, buildOptionsSliceHash, hashFingerprint, hashSchema } from './ArtifactFingerprinter';
import type { ArtifactKind, ManifestArtifact, ManifestReference, OptionsSlice, ReuseConflictErrorDetails, ReuseLookupResult, ReuseStoreManifest } from './types';
import { ReuseConflictError } from './types';

const rename = promisify(fsRename);

const MANIFEST_VERSION = 2;
const MANIFEST_FILENAME = 'manifest.json';

export type RegisterParams = {
    name: string;
    kind: ArtifactKind;
    schema: Record<string, unknown>;
    optionsSlice: OptionsSlice;
    relativeArtifactPath: string;
    contentHash: string;
    specItem: string;
    inputPath: string;
    outputPath: string;
    byteSize?: number;
    skipConflictCheck?: boolean;
};

export type GcResult = {
    deletedKeys: string[];
    deletedFiles: string[];
};

function nameKindIndexKey(name: string, kind: ArtifactKind): string {
    return `${name}|${kind}`;
}

export class ReuseStore {
    private readonly rootPath: string;
    private manifest: ReuseStoreManifest;
    private dirty = false;
    private readonly nameKindIndex = new Map<string, ManifestArtifact[]>();

    constructor(storeRootPath: string) {
        this.rootPath = resolveHelper(process.cwd(), storeRootPath);
        this.manifest = this.createEmptyManifest();
    }

    getRootPath(): string {
        return this.rootPath;
    }

    getManifestPath(): string {
        return resolveHelper(this.rootPath, MANIFEST_FILENAME);
    }

    resolveArtifactPath(relativePath: string): string {
        return resolveHelper(this.rootPath, relativePath);
    }

    isDirty(): boolean {
        return this.dirty;
    }

    async load(): Promise<void> {
        const manifestPath = this.getManifestPath();
        const exists = await fileSystemHelpers.exists(manifestPath);
        if (!exists) {
            return;
        }

        let parsed: ReuseStoreManifest | undefined;
        try {
            const raw = await fileSystemHelpers.readFile(manifestPath, 'utf8');
            parsed = JSON.parse(raw) as ReuseStoreManifest;
        } catch {
            // Corrupted JSON — treat as bad manifest
        }

        if (!parsed || parsed.version !== MANIFEST_VERSION || !parsed.artifacts) {
            await this.cleanOrphanArtifacts();
            return;
        }

        this.manifest = parsed;
        this.rebuildNameKindIndex();
        this.dirty = false;
    }

    async save(): Promise<void> {
        if (!this.dirty) {
            return;
        }

        this.manifest.updatedAt = new Date().toISOString();
        this.manifest.generatorVersion = process.env.npm_package_version || 'dev';
        await fileSystemHelpers.mkdir(this.rootPath);

        const manifestPath = this.getManifestPath();
        const tmpPath = `${manifestPath}.tmp`;
        await fileSystemHelpers.writeFile(tmpPath, JSON.stringify(this.manifest, null, 2));
        try {
            await rename(tmpPath, manifestPath);
        } catch {
            // Windows: target may exist — try unlinking first
            await fileSystemHelpers.rmdir(tmpPath);
            await fileSystemHelpers.writeFile(manifestPath, JSON.stringify(this.manifest, null, 2));
        }
        this.dirty = false;
    }

    lookup(name: string, kind: ArtifactKind, schema: Record<string, unknown>, optionsSlice: OptionsSlice): ReuseLookupResult {
        const schemaHash = hashSchema(schema);
        const optionsSliceHash = buildOptionsSliceHash(optionsSlice);
        const artifactKey = buildArtifactKey(name, kind, schemaHash, optionsSliceHash);
        const existingByKey = this.manifest.artifacts[artifactKey];

        if (existingByKey) {
            return { status: 'hit', artifactKey, entry: existingByKey };
        }

        const conflict = this.findNameKindConflict(name, kind, schemaHash);
        if (conflict) {
            return {
                status: 'conflict',
                artifactKey,
                existing: conflict,
                incomingSchemaHash: schemaHash,
            };
        }

        return { status: 'miss', artifactKey, schemaHash, optionsSliceHash };
    }

    checkConflict(name: string, kind: ArtifactKind, schema: Record<string, unknown>, incomingSpec: string): void {
        const schemaHash = hashSchema(schema);
        const existing = this.findNameKindConflict(name, kind, schemaHash);
        if (!existing) {
            return;
        }

        const details: ReuseConflictErrorDetails = {
            name,
            kind,
            existingSpec: existing.firstSeenSpec,
            incomingSpec,
            existingSchemaHash: existing.schemaHash,
            incomingSchemaHash: schemaHash,
        };
        throw new ReuseConflictError(details);
    }

    register(params: RegisterParams): ManifestArtifact {
        const { name, kind, schema, optionsSlice, relativeArtifactPath, contentHash, specItem, inputPath, outputPath, byteSize = 0, skipConflictCheck = false } = params;
        if (!skipConflictCheck) {
            this.checkConflict(name, kind, schema, specItem);
        }
        this.assertPathAvailable(relativeArtifactPath, name, kind, schema, optionsSlice, specItem);

        const schemaHash = hashSchema(schema);
        const optionsSliceHash = buildOptionsSliceHash(optionsSlice);
        const artifactKey = buildArtifactKey(name, kind, schemaHash, optionsSliceHash);
        const now = new Date().toISOString();
        const reference: ManifestReference = {
            specItem,
            outputPath,
        };

        const existing = this.manifest.artifacts[artifactKey];
        if (existing) {
            if (!existing.referencedBy.some(ref => ref.specItem === specItem && ref.outputPath === outputPath)) {
                existing.referencedBy.push(reference);
                this.markDirty();
            }
            if (existing.contentHash !== contentHash || existing.byteSize !== byteSize) {
                existing.updatedAt = now;
                existing.contentHash = contentHash;
                existing.byteSize = byteSize;
                this.markDirty();
            }
            this.trackSpecItem(specItem, inputPath, artifactKey);
            return existing;
        }

        const entry: ManifestArtifact = {
            artifactKey,
            name,
            kind,
            schemaHash,
            optionsSliceHash,
            relativePath: relativeArtifactPath,
            contentHash,
            byteSize,
            firstSeenSpec: specItem,
            referencedBy: [reference],
            createdAt: now,
            updatedAt: now,
        };

        this.manifest.artifacts[artifactKey] = entry;
        const indexKey = nameKindIndexKey(name, kind);
        const bucket = this.nameKindIndex.get(indexKey);
        if (bucket) {
            bucket.push(entry);
        } else {
            this.nameKindIndex.set(indexKey, [entry]);
        }
        this.trackSpecItem(specItem, inputPath, artifactKey);
        this.markDirty();
        return entry;
    }

    markReferenced(artifactKey: string, reference: ManifestReference, inputPath?: string): void {
        const entry = this.manifest.artifacts[artifactKey];
        if (!entry) {
            return;
        }

        const existingRef = entry.referencedBy.find(ref => ref.specItem === reference.specItem && ref.outputPath === reference.outputPath);
        if (existingRef) {
            // reference already recorded, no update needed
        } else {
            entry.referencedBy.push(reference);
            entry.updatedAt = new Date().toISOString();
            this.markDirty();
        }

        if (inputPath) {
            this.trackSpecItem(reference.specItem, inputPath, artifactKey);
        }
    }

    async verifyArtifactIntegrity(entry: ManifestArtifact): Promise<boolean> {
        const content = await this.readArtifactIfIntegrityOk(entry);
        return content !== null;
    }

    async readArtifactIfIntegrityOk(entry: ManifestArtifact): Promise<string | null> {
        const absolutePath = this.resolveArtifactPath(entry.relativePath);
        const exists = await fileSystemHelpers.exists(absolutePath);
        if (!exists) {
            return null;
        }

        const fileSize = await fileSystemHelpers.getFileSize(absolutePath);
        if (fileSize !== entry.byteSize) {
            return null;
        }

        const content = await fileSystemHelpers.readFile(absolutePath, 'utf8');

        if (ReuseStore.hashContent(content) !== entry.contentHash) {
            return null;
        }

        return content;
    }

    async readArtifact(relativePath: string): Promise<string> {
        const absolutePath = this.resolveArtifactPath(relativePath);
        return fileSystemHelpers.readFile(absolutePath, 'utf8');
    }

    async writeArtifact(relativeArtifactPath: string, content: string): Promise<void> {
        const absolutePath = this.resolveArtifactPath(relativeArtifactPath);
        await fileSystemHelpers.mkdir(dirname(absolutePath));
        await fileSystemHelpers.writeFile(absolutePath, content);
    }

    static hashContent(content: string): string {
        return hashFingerprint(content);
    }

    getManifest(): Readonly<ReuseStoreManifest> {
        return this.manifest;
    }

    async gc(referencedKeys: Set<string>): Promise<GcResult> {
        const deletedKeys: string[] = [];
        const deletedFiles: string[] = [];

        for (const [artifactKey, entry] of Object.entries(this.manifest.artifacts)) {
            if (referencedKeys.has(artifactKey)) {
                continue;
            }

            const absolutePath = this.resolveArtifactPath(entry.relativePath);
            const exists = await fileSystemHelpers.exists(absolutePath);
            if (exists) {
                await fileSystemHelpers.rmdir(absolutePath);
                deletedFiles.push(entry.relativePath);
            }

            delete this.manifest.artifacts[artifactKey];
            const indexKey = nameKindIndexKey(entry.name, entry.kind);
            const bucket = this.nameKindIndex.get(indexKey);
            if (bucket) {
                const filtered = bucket.filter(e => e.artifactKey !== artifactKey);
                if (filtered.length === 0) {
                    this.nameKindIndex.delete(indexKey);
                } else {
                    this.nameKindIndex.set(indexKey, filtered);
                }
            }
            deletedKeys.push(artifactKey);
        }

        if (deletedKeys.length > 0) {
            this.markDirty();
            const deletedSet = new Set(deletedKeys);
            for (const specItem of Object.values(this.manifest.specItems)) {
                specItem.artifactKeys = specItem.artifactKeys.filter(k => !deletedSet.has(k));
            }
        }

        return { deletedKeys, deletedFiles };
    }

    private createEmptyManifest(): ReuseStoreManifest {
        return {
            version: MANIFEST_VERSION,
            generatorVersion: process.env.npm_package_version || 'dev',
            updatedAt: new Date().toISOString(),
            artifacts: {},
            specItems: {},
        };
    }

    private rebuildNameKindIndex(): void {
        this.nameKindIndex.clear();
        for (const entry of Object.values(this.manifest.artifacts)) {
            const key = nameKindIndexKey(entry.name, entry.kind);
            const bucket = this.nameKindIndex.get(key);
            if (bucket) {
                bucket.push(entry);
            } else {
                this.nameKindIndex.set(key, [entry]);
            }
        }
    }

    private findNameKindConflict(name: string, kind: ArtifactKind, schemaHash: string): ManifestArtifact | undefined {
        const bucket = this.nameKindIndex.get(nameKindIndexKey(name, kind));
        if (!bucket) {
            return undefined;
        }
        return bucket.find(entry => entry.schemaHash !== schemaHash);
    }

    private assertPathAvailable(relativeArtifactPath: string, name: string, kind: ArtifactKind, schema: Record<string, unknown>, optionsSlice: OptionsSlice, specItem: string): void {
        const schemaHash = hashSchema(schema);
        const optionsSliceHash = buildOptionsSliceHash(optionsSlice);
        const artifactKey = buildArtifactKey(name, kind, schemaHash, optionsSliceHash);

        for (const entry of Object.values(this.manifest.artifacts)) {
            if (entry.relativePath !== relativeArtifactPath) {
                continue;
            }

            if (entry.artifactKey === artifactKey) {
                return;
            }

            const details: ReuseConflictErrorDetails = {
                name,
                kind,
                existingSpec: entry.firstSeenSpec,
                incomingSpec: specItem,
                existingSchemaHash: entry.schemaHash,
                incomingSchemaHash: schemaHash,
            };
            throw new ReuseConflictError(details);
        }
    }

    private trackSpecItem(specItem: string, input: string, artifactKey: string): void {
        const existing = this.manifest.specItems[specItem];
        if (existing) {
            if (existing.artifactKeys.includes(artifactKey)) {
                return;
            }
            existing.artifactKeys.push(artifactKey);
            existing.lastGeneratedAt = new Date().toISOString();
            this.markDirty();
            return;
        }

        this.manifest.specItems[specItem] = {
            input,
            lastGeneratedAt: new Date().toISOString(),
            artifactKeys: [artifactKey],
        };
        this.markDirty();
    }

    private markDirty(): void {
        this.dirty = true;
    }

    private async cleanOrphanArtifacts(): Promise<void> {
        const artifactsDir = join(this.rootPath, 'artifacts');
        const exists = await fileSystemHelpers.exists(artifactsDir);
        if (!exists) {
            return;
        }
        await fileSystemHelpers.rmdir(artifactsDir);
    }
}
