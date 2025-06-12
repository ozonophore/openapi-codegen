import { resolve } from 'path';

import { HttpClient } from '../types/Enums';
import { IOutput } from '../types/Models';
import type { Service } from '../types/shared/Service.model';
import { writeFile } from './fileSystem';
import { format } from './format';
import { Templates } from './registerHandlebarTemplates';

type TServeceOutputsPath = Omit<IOutput, 'output' | 'outputSchemas'>;

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
export async function writeClientServices(options: IWriteClientServices): Promise<void> {
    const { services, templates, outputPaths, httpClient, useUnionTypes, useOptions, useCancelableRequest } = options;
    for (const service of services) {
        const file = resolve(outputPaths.outputServices, `${service.name}.ts`);
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
        await writeFile(file, formattedValue);
    }
}
