/* istanbul ignore file */
import { JSONSchema4Type, JSONSchema6Type, JSONSchema7Type } from 'json-schema';

import { dirNameHelper } from '../common/utils/pathHelpers';
import { OutputPaths } from './types/base/OutputPaths.model';
import { PrefixArtifacts } from './types/base/PrefixArtifacts.model';
import { $Root } from './types/base/Root.model';
import { getFileName } from './utils/getFileName';
import { isString } from './utils/isString';

type TContextProps = {
    input: string | Record<string, any>;
    output: OutputPaths;
    prefix?: PrefixArtifacts;
    sortByRequired?: boolean;
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

    constructor({ input, output, prefix, sortByRequired }: TContextProps) {
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

    public get($ref: string): JSONSchema4Type | JSONSchema6Type | JSONSchema7Type {
        if (!this._refs) {
            throw new Error('Context must be initialized');
        }
        return this._refs.get($ref);
    }

    public paths(...types: string[]): string[] {
        if (!this._refs) {
            throw new Error('Context must be initialized');
        }
        return this._refs.paths(...types);
    }

    public exists($ref: string): boolean {
        if (!this._refs) {
            throw new Error('Context must be initialized');
        }
        return this._refs.exists($ref);
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
}
