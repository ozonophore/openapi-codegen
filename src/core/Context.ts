/* istanbul ignore file */
import { JSONSchema4Type, JSONSchema6Type, JSONSchema7Type } from 'json-schema';
import RefParser from 'json-schema-ref-parser';
import { dirname } from 'path';

import { getFileName } from '../utils/getFileName';
import { isString } from '../utils/isString';

interface $Root {
    path: string;
    fileName?: string;
}

export class Context {
    private _refs: RefParser.$Refs;
    private _root: $Root;

    constructor(input: string | Record<string, any>) {
        this._refs = {} as RefParser.$Refs;
        if (isString(input)) {
            this._root = { path: dirname(input), fileName: getFileName(input) };
        } else {
            this._root = { path: '' };
        }
    }

    public addRefs(refs: RefParser.$Refs): Context {
        this._refs = refs;
        return this;
    }

    public values(...types: string[]): Record<string, any> {
        return this._refs.values(...types);
    }

    public get($ref: string): JSONSchema4Type | JSONSchema6Type | JSONSchema7Type {
        return this._refs.get($ref);
    }

    public paths(...types: string[]): string[] {
        return this._refs.paths(...types);
    }

    public exists($ref: string): boolean {
        return this._refs.exists($ref);
    }

    public fileName(): string {
        return this._root.fileName ? this._root.fileName : '';
    }
}
