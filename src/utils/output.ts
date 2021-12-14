/* istanbul ignore file */
/**
 * @param output The relative location of the output directory(or index)
 * @param outputCore The relative location of the output directory for core
 * @param outputServices The relative location of the output directory for services
 * @param outputModels The relative location of the output directory for models
 * @param outputSchemas The relative location of the output directory for schemas
 */
export interface IOutput {
    output: string;
    outputCore?: string;
    outputServices?: string;
    outputModels?: string;
    outputSchemas?: string;
}
