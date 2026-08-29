/* istanbul ignore file */
import { JSONSchema4Type, JSONSchema6Type, JSONSchema7Type } from 'json-schema';

import { APP_LOGGER } from '../common/Consts';
import { dirNameHelper } from '../common/utils/pathHelpers';
import { OpenApiGeneratorPlugin, SchemaTypeOverrideContext } from './plugins/GeneratorPlugin.model';
import { buildVirtualFileMap, VirtualFileMap } from './specLoad/VirtualFileMap';
import { OutputPaths } from './types/base/OutputPaths.model';
import { PrefixArtifacts } from './types/base/PrefixArtifacts.model';
import { $Root } from './types/base/Root.model';
import { splitCanonicalRef } from './utils/canonicalRef';
import { getFileName } from './utils/getFileName';
import { isString } from './utils/isString';
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

    private _refLookup?: RefLookup;
    private _map?: VirtualFileMap;

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
        this._refs = refs;
        const entrySource = splitCanonicalRef(absoluteEntryFile).sourceFile;
        this._refLookup = new RefLookup(refs.paths(), entrySource);
        this._map = buildVirtualFileMap(refs, this._refLookup, absoluteEntryFile, this._output);
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
        if (sourceFile && !isRemoteSourceFile(sourceFile) && !this._refLookup?.internExact(sourceFile)) {
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
        if (!this._map) {
            throw new Error('Context must be initialized');
        }
        return this._map.output;
    }

    public get map(): VirtualFileMap {
        if (!this._map) {
            throw new Error('Context must be initialized');
        }
        return this._map;
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

    public getAllCanonicalRefs(): string[] {
        if (!this._map) {
            throw new Error('Context must be initialized');
        }
        return this._map.getCanonicalRefs();
    }

    /**
     * Tree $ref + Parent source file → Canonical Ref (`$Refs` lookup key).
     */
    public toCanonicalRef($ref: string, parentSourceFile?: string): string {
        if (!this._refLookup) {
            throw new Error('Context must be initialized');
        }
        return this._refLookup.toCanonicalRef($ref, parentSourceFile);
    }
}
