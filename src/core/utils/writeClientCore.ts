import { resolve } from 'path';

import { HttpClient } from '../types/Enums';
import type { Client } from '../types/shared/Client.model';
import { fileSystem } from './fileSystem';
import { Templates } from './registerHandlebarTemplates';

/**
 * @param client Client object, containing, models, schemas and services
 * @param templates The loaded handlebar templates
 * @param outputCorePath The directory for generating the kernel settings
 * @param httpClient The selected httpClient (fetch, xhr or node)
 * @param request: Path to custom request file
 * @param useCancelableRequest Use cancelable request type
 */
interface IWriteClientCore {
    client: Client;
    templates: Templates;
    outputCorePath: string;
    httpClient: HttpClient;
    request?: string;
    useCancelableRequest?: boolean;
}

/**
 * Generate OpenAPI core files, this includes the basic boilerplate code to handle requests.
 * @param client Client object, containing, models, schemas and services
 * @param templates The loaded handlebar templates
 * @param outputCorePath The directory for generating the kernel settings
 * @param httpClient The selected httpClient (fetch, xhr or node)
 * @param request: Path to custom request file
 * @param useCancelableRequest Use cancelable request type
 */
export async function writeClientCore(options: IWriteClientCore): Promise<void> {
    const { client, templates, outputCorePath, httpClient, request, useCancelableRequest } = options;
    const context = {
        httpClient,
        server: client.server,
        version: client.version,
        useCancelableRequest,
    };

    await fileSystem.writeFile(resolve(outputCorePath, 'OpenAPI.ts'), templates.core.settings(context));
    await fileSystem.writeFile(resolve(outputCorePath, 'ApiError.ts'), templates.core.apiError({}));
    await fileSystem.writeFile(resolve(outputCorePath, 'ApiRequestOptions.ts'), templates.core.apiRequestOptions({}));
    await fileSystem.writeFile(resolve(outputCorePath, 'ApiResult.ts'), templates.core.apiResult({}));
    if (useCancelableRequest) {
        await fileSystem.writeFile(resolve(outputCorePath, 'CancelablePromise.ts'), templates.core.cancelablePromise({}));
    }
    await fileSystem.writeFile(resolve(outputCorePath, 'HttpStatusCode.ts'), templates.core.httpStatusCode({}));
    await fileSystem.writeFile(resolve(outputCorePath, 'request.ts'), templates.core.request(context));

    if (request) {
        const requestFile = resolve(process.cwd(), request);
        const requestFileExists = await fileSystem.exists(requestFile);
        if (!requestFileExists) {
            throw new Error(`Custom request file "${requestFile}" does not exists`);
        }
        await fileSystem.copyFile(requestFile, resolve(outputCorePath, 'request.ts'));
    }
}
