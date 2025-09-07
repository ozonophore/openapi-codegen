import { TOptions } from "../../common/Options"
import { HttpClient } from "../types/Enums"
import { isBoolean } from "./isBoolean"

/**
 * Preparation the configuration
 * @param options 
 * @returns 
 */
export function prepareOptions(options: TOptions): TOptions {
    return {
        input: options.input || '',
        output: options.output || '',
        outputCore: options?.outputCore ? options.outputCore : '',
        outputServices: options?.outputServices ? options.outputServices : '',
        outputModels: options?.outputModels ? options.outputModels :  '',
        outputSchemas: options?.outputSchemas ? options.outputSchemas : '',
        httpClient: options?.httpClient ? options.httpClient : HttpClient.FETCH,
        useOptions: isBoolean(options?.useOptions),
        useUnionTypes: isBoolean(options?.useUnionTypes),
        exportCore: isBoolean(options?.exportCore, true),
        exportServices: isBoolean(options?.exportServices, true),
        exportModels: isBoolean(options?.exportModels, true),
        exportSchemas: isBoolean(options?.exportSchemas),
        clean: isBoolean(options?.clean, true),
        request: options?.request ? options.request : '',
        interfacePrefix: options?.interfacePrefix ? options.interfacePrefix : 'I',
        enumPrefix: options?.enumPrefix ? options.enumPrefix : 'E',
        typePrefix: options?.typePrefix ? options.typePrefix : 'T',
        useCancelableRequest: isBoolean(options?.useCancelableRequest),
        useSeparatedIndexes: isBoolean(options?.useSeparatedIndexes),
    }
}