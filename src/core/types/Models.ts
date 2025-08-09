import { GROUP_PRIORITY_EXTENDED, GROUP_PRIORITY_SIMPLE } from './Consts';
import { TypeRef } from './Enums';

/**
 * @param output The relative location of the output directory(or index)
 * @param outputCore The relative location of the output directory for core
 * @param outputServices The relative location of the output directory for services
 * @param outputModels The relative location of the output directory for models
 * @param outputSchemas The relative location of the output directory for schemas
 */
export interface IOutput {
    output: string;
    outputCore: string;
    outputServices: string;
    outputModels: string;
    outputSchemas: string;
}

/**
 * Ref With type
 * @prop value Value
 * @prop type The type of object passed via ref
 */
export interface IRefWithtype {
    value: string;
    type: TypeRef;
}

export interface $Root {
    path: string;
    fileName?: string;
}

export interface Prefix {
    interface: string;
    enum: string;
    type: string;
}

export type TPropertyGroupExtended = keyof typeof GROUP_PRIORITY_EXTENDED;

export type TPropertyGroupSimple = keyof typeof GROUP_PRIORITY_SIMPLE;
