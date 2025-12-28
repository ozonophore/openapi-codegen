import { Context } from '../../Context';
import { getModelNameWithPrefix } from '../../utils/getModelNameWithPrefix';
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

            return getModelNameWithPrefix(value, definition, this._context.prefix);
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
