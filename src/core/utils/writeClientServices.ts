import { resolveHelper } from '../../common/utils/pathHelpers';
import { OutputPaths } from '../types/base/OutputPaths.model';
import { HttpClient } from '../types/enums/HttpClient.enum';
import type { Service } from '../types/shared/Service.model';
import { WriteClient } from '../WriteClient';
import { fileSystem } from './fileSystem';
import { format } from './format';
import { Templates } from './registerHandlebarTemplates';

type TServeceOutputsPath = Omit<OutputPaths, 'output' | 'outputSchemas'>;

/**
 * @param services Array of Services to write
 * @param templates The loaded handlebar templates
 * @param outputServicePath Folder options for generating the core, models, and service part
 * @param httpClient The selected httpClient (fetch, xhr or node)
 * @param useUnionTypes Use union types instead of enums
 * @param useOptions Use options or arguments functions
 * @param useCancelableRequest Use cancelable request type
 */
interface IWriteClientServices {
    services: Service[];
    templates: Templates;
    outputPaths: TServeceOutputsPath;
    httpClient: HttpClient;
    useUnionTypes: boolean;
    useOptions: boolean;
    useCancelableRequest: boolean;
}

/**
 * Generate Services using the Handlebar template and write to disk.
 * @param services Array of Services to write
 * @param templates The loaded handlebar templates
 * @param outputServicePath Folder options for generating the core, models, and service part
 * @param httpClient The selected httpClient (fetch, xhr or node)
 * @param useUnionTypes Use union types instead of enums
 * @param useOptions Use options or arguments functions
 */
export async function writeClientServices(this: WriteClient, options: IWriteClientServices): Promise<void> {
    const { services, templates, outputPaths, httpClient, useUnionTypes, useOptions, useCancelableRequest } = options;

    this.logger.info('Recording of service files begins');

    for (const service of services) {
        const file = resolveHelper(outputPaths.outputServices, `${service.name}.ts`);

        this.logger.info(`The recording of the file data begins: ${file}`);

        const templateResult = templates.exports.service({
            ...service,
            httpClient,
            useUnionTypes,
            useOptions,
            outputCore: outputPaths.outputCore,
            outputModels: outputPaths.outputModels,
            useCancelableRequest,
        });
        const formattedValue = await format(templateResult);
        await fileSystem.writeFile(file, formattedValue);

        this.logger.info(`File recording completed: ${file}`);
    }

    this.logger.info('Service file recording completed successfully');
}
