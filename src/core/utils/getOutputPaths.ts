import { resolveHelper } from '../../common/utils/pathHelpers';
import { OutputPaths } from '../types/base/OutputPaths.model';
import { isSubDirectory } from '../utils/isSubdirectory';

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

    const outputPath = resolveHelper(rootPath, output);
    const outputPathCore = outputCore ? resolveHelper(rootPath, outputCore) : resolveHelper(outputPath, 'core');
    const outputPathModels = outputModels ? resolveHelper(rootPath, outputModels) : resolveHelper(outputPath, 'models');
    const outputPathSchemas = outputSchemas ? resolveHelper(rootPath, outputSchemas) : resolveHelper(outputPath, 'schemas');
    const outputPathServices = outputServices ? resolveHelper(rootPath, outputServices) : resolveHelper(outputPath, 'services');

    return {
        output: outputPath,
        outputCore: outputPathCore,
        outputServices: outputPathServices,
        outputModels: outputPathModels,
        outputSchemas: outputPathSchemas,
    };
};
