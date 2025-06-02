/* istanbul ignore file */
import { JSONSchema4Type, JSONSchema6Type, JSONSchema7Type } from 'json-schema';
import RefParser from 'json-schema-ref-parser';

import { ESortStrategy } from '../types/Enums';
import { getFileName } from '../utils/getFileName';
import { isString } from '../utils/isString';
import { IOutput } from '../utils/output';
import { dirName } from './path';

interface $Root {
    path: string;
    fileName?: string;
}

export interface Prefix {
    interface: string;
    enum: string;
    type: string;
}

interface IOptionals {
    prefix?: Prefix;
    propSortStrategy: ESortStrategy;
}

/**
 * A Context wich can share a data between methods
 */
export class Context {
    private _refs: RefParser.$Refs | undefined;
    private _root: $Root | undefined;
    private _output: IOutput;
    public prefix: Prefix = {
        interface: 'I',
        enum: 'E',
        type: 'T',
    };

    private _propSortStrategy = ESortStrategy.AS_IS;

    public get propSortStrategy() {
        return this._propSortStrategy;
    }

    public set propSortStrategy(value: ESortStrategy) {
        this._propSortStrategy = value;
    }

    constructor(input: string | Record<string, any>, output: IOutput, optionals?: IOptionals) {
        this._output = output;
        this._refs = {} as RefParser.$Refs;
        if (isString(input)) {
            this._root = { path: dirName(input), fileName: getFileName(input) };
        } else {
            this._root = { path: '' };
        }
        if (optionals?.prefix) {
            this.prefix = optionals.prefix;
        }
        if (optionals?.propSortStrategy) {
            this._propSortStrategy = optionals.propSortStrategy;
        }
        return this;
    }

    public addRefs(refs: RefParser.$Refs): Context {
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
}
