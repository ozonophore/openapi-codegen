/* istanbul ignore file */
import { JSONSchema4Type, JSONSchema6Type, JSONSchema7Type } from 'json-schema';
import { basename } from 'path';

import { APP_LOGGER } from '../common/Consts';
import { dirNameHelper, normalizeHelper, relativeHelper, resolveHelper } from '../common/utils/pathHelpers';
import { OpenApiGeneratorPlugin, SchemaTypeOverrideContext } from './plugins/GeneratorPlugin.model';
import { OutputPaths } from './types/base/OutputPaths.model';
import { PrefixArtifacts } from './types/base/PrefixArtifacts.model';
import { $Root } from './types/base/Root.model';
import { splitCanonicalRef } from './utils/canonicalRef';
import { getFileName } from './utils/getFileName';
import { isString } from './utils/isString';
import { internParserKey } from './utils/parserKeyMatch';
import { isRemoteSourceFile, RefLookup } from './utils/refLookup';

type TContextProps = {
    input: string | Record<string, any>;
    output: OutputPaths;
    prefix?: PrefixArtifacts;
    sortByRequired?: boolean;
    plugins?: OpenApiGeneratorPlugin[];
    strictPluginMode?: boolean;
};

type RefsLike = {
    values: (...args: any[]) => Record<string, any>;
    get: (...args: any[]) => JSONSchema4Type | JSONSchema6Type | JSONSchema7Type;
    paths: (...args: any[]) => string[];
    exists: (...args: any[]) => boolean;
};

interface VirtualFile {
    /** Абсолютный путь исходного файла (БЕЗ fragment) */
    sourceFile: string;

    /** Абсолютный путь output-файла (.ts) */
    outputFile: string;

    /** Все fragment'ы, которые встречались у этого файла */
    fragments: Set<string>;
}

type VirtualFileMap = Map<string, VirtualFile>;

/**
 * A Context wich can share a data between methods
 */
export class Context {
    private _refs: RefsLike | undefined;
    private _root: $Root | undefined;
    private _output: OutputPaths;
    public prefix: PrefixArtifacts = {
        interface: 'I',
        enum: 'E',
        type: 'T',
    };

    private _sortByRequired: boolean = false;
    private _plugins: OpenApiGeneratorPlugin[] = [];
    private _strictPluginMode: boolean = false;

    private specRoot!: string;
    private virtualFiles: VirtualFileMap = new Map();
    private canonicalRefs = new Set<string>();
    private refLookup?: RefLookup;

    constructor({ input, output, prefix, sortByRequired, plugins, strictPluginMode }: TContextProps) {
        this._output = output;
        if (isString(input)) {
            this._root = { dirName: dirNameHelper(input), path: input, fileName: getFileName(input) };
        } else {
            this._root = { dirName: '', path: '' };
        }
        if (prefix) {
            this.prefix = prefix;
        }

        if (sortByRequired !== undefined && sortByRequired !== null) {
            this._sortByRequired = sortByRequired;
        }

        this._plugins = plugins || [];
        this._strictPluginMode = strictPluginMode ?? false;

        return this;
    }

    /**
     * @internal Prefer `createResolvedContext` — binds Swagger refs + virtual file map in one step.
     */
    attachResolvedOpenApi(refs: RefsLike, absoluteEntryFile: string): void {
        this.addRefs(refs);
        const entrySource = splitCanonicalRef(absoluteEntryFile).sourceFile;
        this.refLookup = new RefLookup(refs.paths(), entrySource);
        this.initializeVirtualFileMap();
    }

    private addRefs(refs: RefsLike): Context {
        this._refs = refs;
        return this;
    }

    public values(...types: string[]): Record<string, any> {
        if (!this._refs) {
            throw new Error('Context must be initialized');
        }
        return this._refs.values(...types);
    }

    public get($ref: string, parentSourceFile?: string): JSONSchema4Type | JSONSchema6Type | JSONSchema7Type {
        if (!this._refs) {
            throw new Error('Context must be initialized');
        }
        return this._refs.get(this.toCanonicalRef($ref, parentSourceFile));
    }

    public paths(...types: string[]): string[] {
        if (!this._refs) {
            throw new Error('Context must be initialized');
        }
        return this._refs.paths(...types);
    }

    public exists($ref: string, parentSourceFile?: string): boolean {
        if (!this._refs) {
            throw new Error('Context must be initialized');
        }
        const canonicalRef = this.toCanonicalRef($ref, parentSourceFile);
        const sourceFile = splitCanonicalRef(canonicalRef).sourceFile;
        if (sourceFile && !isRemoteSourceFile(sourceFile) && !this.refLookup?.internExact(sourceFile)) {
            return false;
        }
        return this._refs.exists(canonicalRef);
    }

    public fileName(): string {
        if (!this._root) {
            throw new Error('Context must be initialized');
        }
        return this._root.fileName ? this._root.fileName : '';
    }

    public get output() {
        if (!this._output) {
            throw new Error('Context must be initialized');
        }
        return this._output;
    }

    public get sortByRequired() {
        return this._sortByRequired;
    }

    public get root(): $Root | undefined {
        return this._root;
    }

    /**
     * Resolves custom type override for schema via registered plugins.
     */
    public resolveSchemaTypeOverride(schema: Record<string, any>, context: SchemaTypeOverrideContext): string | undefined {
        for (const plugin of this._plugins) {
            if (!plugin.resolveSchemaTypeOverride) {
                continue;
            }
            try {
                const override = plugin.resolveSchemaTypeOverride({ schema, context });
                if (typeof override === 'string' && override.trim()) {
                    return override.trim();
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                if (this._strictPluginMode) {
                    throw new Error(`Plugin "${plugin.name}" failed in resolveSchemaTypeOverride: ${message}`);
                }
                APP_LOGGER.warn(`Plugin "${plugin.name}" failed in resolveSchemaTypeOverride: ${message}`);
            }
        }
        return undefined;
    }

    private posixNormalizeSource(sourceFile: string): string {
        const file = splitCanonicalRef(sourceFile).sourceFile;
        if (!file) {
            return '';
        }
        return normalizeHelper(file);
    }

    private posixDirnameSource(sourceFile: string): string {
        const file = splitCanonicalRef(sourceFile).sourceFile;
        return dirNameHelper(file);
    }

    private mapSourceToOutput(sourceFile: string): string {
        const alignedRoot = internParserKey(this.specRoot);
        const alignedSource = internParserKey(sourceFile);
        const relative = relativeHelper(alignedRoot, alignedSource);

        const dir = this.posixDirnameSource(relative);
        const baseName = basename(relative).replace(/\.(yaml|yml|json)$/i, '.ts');

        return resolveHelper(this.output.outputModels, dir, baseName);
    }

    private walkSchemaForFragments(obj: any, parentSourceFile: string) {
        if (!obj || typeof obj !== 'object') return;

        if (typeof obj.$ref === 'string') {
            const canonicalRef = this.toCanonicalRef(obj.$ref, parentSourceFile);
            const { sourceFile, pointer } = splitCanonicalRef(canonicalRef);

            if (isRemoteSourceFile(sourceFile)) {
                this.canonicalRefs.add(canonicalRef);
            } else {
                const exact = this.refLookup?.internExact(sourceFile);
                if (exact) {
                    this.canonicalRefs.add(canonicalRef);
                    let entry = this.virtualFiles.get(exact);
                    if (!entry) {
                        entry = {
                            sourceFile: exact,
                            outputFile: this.mapSourceToOutput(exact),
                            fragments: new Set(),
                        };
                        this.virtualFiles.set(exact, entry);
                    }
                    if (pointer) {
                        entry.fragments.add(pointer);
                    }
                }
            }
        }

        if (Array.isArray(obj)) {
            obj.forEach(item => this.walkSchemaForFragments(item, parentSourceFile));
            return;
        }

        for (const value of Object.values(obj)) {
            this.walkSchemaForFragments(value, parentSourceFile);
        }
    }

    private initializeVirtualFileMap() {
        const normalizedEntry = this.refLookup?.entryFile || '';
        this.specRoot = this.posixNormalizeSource(this.posixDirnameSource(normalizedEntry));

        if (normalizedEntry && !isRemoteSourceFile(normalizedEntry) && !this.virtualFiles.has(normalizedEntry)) {
            this.virtualFiles.set(normalizedEntry, {
                sourceFile: normalizedEntry,
                outputFile: this.mapSourceToOutput(normalizedEntry),
                fragments: new Set(),
            });
        }

        const allPaths = this._refs?.paths() || [];

        for (const refPath of allPaths) {
            const sourceFile = splitCanonicalRef(refPath).sourceFile;
            if (!sourceFile || isRemoteSourceFile(sourceFile)) {
                continue;
            }

            if (!this.virtualFiles.has(sourceFile)) {
                this.virtualFiles.set(sourceFile, {
                    sourceFile,
                    outputFile: this.mapSourceToOutput(sourceFile),
                    fragments: new Set(),
                });
            }
        }

        for (const [sourceFile] of this.virtualFiles) {
            try {
                const schema = this._refs?.get(sourceFile);
                if (schema && typeof schema === 'object') {
                    this.walkSchemaForFragments(schema, sourceFile);
                }
            } catch {
                // Skip unresolved entries from refs.paths().
            }
        }
    }

    public getVirtualFiles(): VirtualFileMap {
        return this.virtualFiles;
    }

    public getAllCanonicalRefs(): string[] {
        return [...this.canonicalRefs];
    }

    public resolveCanonicalRef(
        canonicalRef: string,
        parentSourceFile?: string
    ):
        | {
              outputFile: string;
              fragment?: string;
          }
        | undefined {
        const lookupKey = this.toCanonicalRef(canonicalRef, parentSourceFile);
        const { sourceFile, pointer } = splitCanonicalRef(lookupKey);
        if (!sourceFile || isRemoteSourceFile(sourceFile)) {
            return undefined;
        }

        const file = this.virtualFiles.get(sourceFile);
        if (!file) return undefined;

        return {
            outputFile: file.outputFile,
            fragment: pointer,
        };
    }

    /**
     * Tree $ref + Parent source file → Canonical Ref (`$Refs` lookup key).
     */
    public toCanonicalRef($ref: string, parentSourceFile?: string): string {
        if (!this.refLookup) {
            throw new Error('Context must be initialized');
        }
        return this.refLookup.toCanonicalRef($ref, parentSourceFile);
    }
}
