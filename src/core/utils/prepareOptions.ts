import { TOptions } from "../../common/Options"
import { HttpClient } from "../types/enums/HttpClient.enum"
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
        excludeCoreServiceFiles: isBoolean(options?.excludeCoreServiceFiles, false),
        includeSchemasFiles: isBoolean(options?.includeSchemasFiles, false),
        request: options?.request ? options.request : '',
        interfacePrefix: options?.interfacePrefix ? options.interfacePrefix : 'I',
        enumPrefix: options?.enumPrefix ? options.enumPrefix : 'E',
        typePrefix: options?.typePrefix ? options.typePrefix : 'T',
        useCancelableRequest: isBoolean(options?.useCancelableRequest),
        useSeparatedIndexes: isBoolean(options?.useSeparatedIndexes),
    }
}