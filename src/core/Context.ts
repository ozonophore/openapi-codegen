/* istanbul ignore file */
import { JSONSchema4Type, JSONSchema6Type, JSONSchema7Type } from 'json-schema';
import RefParser from 'json-schema-ref-parser';

import { getFileName } from '../utils/getFileName';
import { isString } from '../utils/isString';
import { IOutput } from '../utils/output';
import { dirName, resolve } from './path';

interface $Root {
    path: string;
    fileName?: string;
}

export interface Prefix {
    interface: string;
    enum: string;
    type: string;
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

    constructor(input: string | Record<string, any>, output: IOutput, prefix?: Prefix) {
        const outputPath = resolve(process.cwd(), output.output);
        this._output = {
            output: outputPath,
            outputCore: output.outputCore ? resolve(process.cwd(), output.outputCore) : outputPath,
            outputServices: output.outputServices ? resolve(process.cwd(), output.outputServices) : outputPath,
            outputModels: output.outputModels ? resolve(process.cwd(), output.outputModels) : outputPath,
            outputSchemas: output.outputSchemas ? resolve(process.cwd(), output.outputSchemas) : outputPath,
        };
        this._refs = {} as RefParser.$Refs;
        if (isString(input)) {
            this._root = { path: dirName(input), fileName: getFileName(input) };
        } else {
            this._root = { path: '' };
        }
        if (prefix) {
            this.prefix = prefix;
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
}
