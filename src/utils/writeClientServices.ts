import { resolve } from 'path';

import type { Service } from '../client/interfaces/Service';
import { HttpClient } from '../HttpClient';
import { writeFile } from './fileSystem';
import { format } from './format';
import { Templates } from './registerHandlebarTemplates';

const VERSION_TEMPLATE_STRING = 'OpenAPI.VERSION';

/**
 * @param services Array of Services to write
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param httpClient The selected httpClient (fetch, xhr or node)
 * @param useUnionTypes Use union types instead of enums
 * @param useOptions Use options or arguments functions
 * @param outputModel The relative path to models
 * @param outputCore The relative path to the core
 * @param useCancelableRequest Use cancelable request type
 */
interface IWriteClientServices {
    services: Service[];
    templates: Templates;
    outputPath: string;
    httpClient: HttpClient;
    useUnionTypes: boolean;
    useOptions: boolean;
    outputModels: string;
    outputCore: string;
    useCancelableRequest: boolean;
}

/**
 * Generate Services using the Handlebar template and write to disk.
 * @param services Array of Services to write
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param httpClient The selected httpClient (fetch, xhr or node)
 * @param useUnionTypes Use union types instead of enums
 * @param useOptions Use options or arguments functions
 */
export async function writeClientServices(options: IWriteClientServices): Promise<void> {
    const { services, templates, outputPath, httpClient, useUnionTypes, useOptions, outputCore, outputModels, useCancelableRequest } = options;
    for (const service of services) {
        const file = resolve(outputPath, `${service.name}.ts`);
        const templateResult = templates.exports.service({
            ...service,
            httpClient,
            useUnionTypes,
            useOptions,
            outputCore,
            outputModels,
            useCancelableRequest,
        });
        await writeFile(file, format(templateResult));
    }
}
