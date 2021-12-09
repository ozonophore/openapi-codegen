import { Context } from '../../core/Context';
import { getRefFromSchema } from '../../utils/getRefFromSchema';
import { getModel } from '../v3/parser/getModel';
import { getModelComposition } from './parser/getModelComposition';
import { getModelProperties } from './parser/getModelProperties';
import { getModels } from './parser/getModels';
import { getOperation } from './parser/getOperation';
import { getOperationParameter } from './parser/getOperationParameter';
import { getOperationParameters } from './parser/getOperationParameters';
import { getOperationRequestBody } from './parser/getOperationRequestBody';
import { getOperationResponse } from './parser/getOperationResponse';
import { getOperationResponses } from './parser/getOperationResponses';
import { getServices } from './parser/getServices';
import { getType } from './parser/getType';
import { parse } from './parserV3';

export class Parser {
    private _context: Context;

    constructor(context: Context) {
        this._context = context;
    }

    get context(): Context {
        return this._context;
    }

    public getTypeNameByRef(value: string, ref?: string): string {
        if (ref) {
            const definition: any = this.context.get(ref);
            if (definition.oneOf || definition.anyOf || definition.allOf || ['string', 'number', 'integer', 'boolean', 'array'].includes(definition.type)) {
                return `${this.context.prefix.type}${value}`;
            } else if (definition.enum && definition !== 'boolean') {
                return `${this.context.prefix.enum}${value}`;
            } else if (definition.type === 'object') {
                return `${this.context.prefix.interface}${value}`;
            }
        }
        return value;
    }

    public parse = parse;
    public getModels = getModels;
    public getType = getType;
    public getModel = getModel;
    public getModelComposition = getModelComposition;
    public getModelProperties = getModelProperties;
    public getServices = getServices;
    public getOperationParameters = getOperationParameters;
    public getOperationParameter = getOperationParameter;
    public getOperation = getOperation;
    public getOperationResponses = getOperationResponses;
    public getOperationResponse = getOperationResponse;
    public getOperationRequestBody = getOperationRequestBody;
}
