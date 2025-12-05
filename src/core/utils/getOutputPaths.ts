import { OutputPaths } from '../types/base/OutputPaths.model';
import { isSubDirectory } from '../utils/isSubdirectory';
import { resolve } from './pathHelpers';

export const getOutputPaths = ({
    output,
    outputCore,
    outputModels,
    outputSchemas,
    outputServices,
}: {
    output: string;
    outputCore?: string | undefined;
    outputServices?: string | undefined;
    outputModels?: string | undefined;
    outputSchemas?: string | undefined;
}): OutputPaths => {
    const rootPath = process.cwd();
    if (!isSubDirectory(rootPath, output)) {
        throw new Error(`Output folder is not a subdirectory of the current working directory`);
    }
    if (outputCore && !isSubDirectory(rootPath, outputCore)) {
        throw new Error(`Output folder(core) is not a subdirectory of the current working directory`);
    }
    if (outputSchemas && !isSubDirectory(rootPath, outputSchemas)) {
        throw new Error(`Output folder(schemas) is not a subdirectory of the current working directory`);
    }
    if (outputModels && !isSubDirectory(rootPath, outputModels)) {
        throw new Error(`Output folder(models) is not a subdirectory of the current working directory`);
    }
    if (outputServices && !isSubDirectory(rootPath, outputServices)) {
        throw new Error(`Output folder(services) is not a subdirectory of the current working directory`);
    }

    const outputPath = resolve(rootPath, output);
    const outputPathCore = outputCore ? resolve(rootPath, outputCore) : resolve(outputPath, 'core');
    const outputPathModels = outputModels ? resolve(rootPath, outputModels) : resolve(outputPath, 'models');
    const outputPathSchemas = outputSchemas ? resolve(rootPath, outputSchemas) : resolve(outputPath, 'schemas');
    const outputPathServices = outputServices ? resolve(rootPath, outputServices) : resolve(outputPath, 'services');

    return {
        output: outputPath,
        outputCore: outputPathCore,
        outputServices: outputPathServices,
        outputModels: outputPathModels,
        outputSchemas: outputPathSchemas,
    };
};
