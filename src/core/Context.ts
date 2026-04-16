/* istanbul ignore file */
import { JSONSchema4Type, JSONSchema6Type, JSONSchema7Type } from 'json-schema';
import { basename, isAbsolute } from 'path';

import { dirNameHelper, normalizeHelper, relativeHelper, resolveHelper } from '../common/utils/pathHelpers';
import { OpenApiGeneratorPlugin, SchemaTypeOverrideContext } from './plugins/GeneratorPlugin.model';
import { OutputPaths } from './types/base/OutputPaths.model';
import { PrefixArtifacts } from './types/base/PrefixArtifacts.model';
import { $Root } from './types/base/Root.model';
import { getFileName } from './utils/getFileName';
import { isString } from './utils/isString';
import { normalizeRef } from './utils/normalizeRef';
import { parseRef, RefType } from './utils/parseRef';

type TContextProps = {
    input: string | Record<string, any>;
    output: OutputPaths;
    prefix?: PrefixArtifacts;
    sortByRequired?: boolean;
    plugins?: OpenApiGeneratorPlugin[];
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

    private specRoot!: string;
    private entryFile?: string;
    private virtualFiles: VirtualFileMap = new Map();

    constructor({ input, output, prefix, sortByRequired, plugins }: TContextProps) {
        this._output = output;
        this._refs = {} as RefsLike;
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

        return this;
    }

    public addRefs(refs: RefsLike): Context {
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
        const normalizedRef = this.normalizeRefForLookup($ref, parentSourceFile);
        return this._refs.get(normalizedRef);
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
        const normalizedRef = this.normalizeRefForLookup($ref, parentSourceFile);
        return this._refs.exists(normalizedRef);
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
            const override = plugin.resolveSchemaTypeOverride?.({ schema, context });
            if (typeof override === 'string' && override.trim()) {
                return override.trim();
            }
        }
        return undefined;
    }

    private canonicalizeRef(ref: string, parentSourceFile: string): { sourceFile: string; fragment?: string } {
        const parsed = parseRef(ref);

        // LOCAL_FRAGMENT → тот же файл
        if (parsed.type === RefType.LOCAL_FRAGMENT) {
            return {
                sourceFile: normalizeHelper(parentSourceFile),
                fragment: parsed.fragment,
            };
        }

        // Внешний ref
        const parentDir = dirNameHelper(parentSourceFile);
        const absSource = resolveHelper(parentDir, parsed.filePath!);

        return {
            sourceFile: normalizeHelper(absSource),
            fragment: parsed.fragment,
        };
    }

    private mapSourceToOutput(sourceFile: string): string {
        const relative = relativeHelper(this.specRoot, sourceFile);

        const dir = dirNameHelper(relative);
        const baseName = basename(relative).replace(/\.(yaml|yml|json)$/i, '.ts');

        return resolveHelper(this.output.outputModels, dir, baseName);
    }

    private walkSchemaForFragments(obj: any, parentSourceFile: string) {
        if (!obj || typeof obj !== 'object') return;

        if (typeof obj.$ref === 'string') {
            const { sourceFile, fragment } = this.canonicalizeRef(obj.$ref, parentSourceFile);

            let entry = this.virtualFiles.get(sourceFile);
            if (!entry) {
                entry = {
                    sourceFile,
                    outputFile: this.mapSourceToOutput(sourceFile),
                    fragments: new Set(),
                };
                this.virtualFiles.set(sourceFile, entry);
            }

            if (fragment) {
                entry.fragments.add(fragment);
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

    public initializeVirtualFileMap(rootSchema: unknown, entryFile: string) {
        this.specRoot = normalizeHelper(dirNameHelper(entryFile));
        const normalizedEntry = normalizeHelper(entryFile);
        this.entryFile = normalizedEntry;

        // Гарантируем, что entry файл тоже есть в карте
        if (!this.virtualFiles.has(normalizedEntry)) {
            this.virtualFiles.set(normalizedEntry, {
                sourceFile: normalizedEntry,
                outputFile: this.mapSourceToOutput(normalizedEntry),
                fragments: new Set(),
            });
        }

        // 🔴 Вместо ручного обхода, использовать resolved.paths() от SwaggerParser
        // это даст нам все файлы, которые парсер разрешил
        const allPaths = this._refs?.paths() || [];
        
        for (const refPath of allPaths) {
            const normalizedPath = normalizeHelper(refPath);
            
            if (!this.virtualFiles.has(normalizedPath)) {
                this.virtualFiles.set(normalizedPath, {
                    sourceFile: normalizedPath,
                    outputFile: this.mapSourceToOutput(normalizedPath),
                    fragments: new Set(),
                });
            }
        }

        // Обходим каждый файл чтобы найти $ref с фрагментами (#)
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
        const result: string[] = [];

        for (const file of this.virtualFiles.values()) {
            if (file.fragments.size > 0) {
                for (const fragment of file.fragments) {
                    result.push(`${file.sourceFile}${fragment}`);
                }
            } else {
                result.push(file.sourceFile);
            }
        }

        return result;
    }

    public resolveCanonicalRef(canonicalRef: string, parentSourceFile?: string):
        | {
              outputFile: string;
              fragment?: string;
          }
        | undefined {
        const normalizedRef = this.normalizeRefForLookup(canonicalRef, parentSourceFile);
        const parsed = parseRef(normalizedRef);

        const sourceFile = normalizeHelper(parsed.filePath ?? '');

        const file = this.virtualFiles.get(sourceFile);
        if (!file) return undefined;

        return {
            outputFile: file.outputFile,
            fragment: parsed.fragment,
        };
    }

    private normalizeRefForLookup(ref: string, parentSourceFile?: string): string {
        if (!ref) return ref;

        // Prefer explicit parent if provided
        if (parentSourceFile) {
            const normalizedParent = isAbsolute(parentSourceFile)
                ? parentSourceFile
                : resolveHelper(this.specRoot, parentSourceFile);
            return normalizeRef(ref, normalizedParent);
        }

        // If we can fall back to entry file, normalize relative refs against it
        if (this.entryFile) {
            const parsed = parseRef(ref);
            if (
                parsed.type === RefType.LOCAL_FRAGMENT ||
                parsed.type === RefType.EXTERNAL_FILE ||
                parsed.type === RefType.EXTERNAL_FILE_FRAGMENT
            ) {
                return normalizeRef(ref, this.entryFile);
            }
        }

        return ref;
    }
}
