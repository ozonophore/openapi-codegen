import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { Templates } from '../types/base/Templates.model';
import { HttpClient } from '../types/enums/HttpClient.enum';
import type { Client } from '../types/shared/Client.model';
import { WriteClient } from '../WriteClient';

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
    useSeparatedIndexes?: boolean;
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
export async function writeClientCore(this: WriteClient, options: IWriteClientCore): Promise<void> {
    const { client, templates, outputCorePath, httpClient, request, useCancelableRequest, useSeparatedIndexes } = options;
    const context = {
        httpClient,
        server: client.server,
        version: client.version,
        useCancelableRequest,
        useSeparatedIndexes,
    };

    this.logger.info("The recording of the kernel files begins");

    const hasCustomRequest = !!request;

    await fileSystemHelpers.writeFile(resolveHelper(outputCorePath, 'OpenAPI.ts'), templates.core.settings(context));
    await fileSystemHelpers.writeFile(resolveHelper(outputCorePath, 'ApiError.ts'), templates.core.apiError({}));
    await fileSystemHelpers.writeFile(resolveHelper(outputCorePath, 'ApiRequestOptions.ts'), templates.core.apiRequestOptions({}));
    await fileSystemHelpers.writeFile(resolveHelper(outputCorePath, 'ApiResult.ts'), templates.core.apiResult({}));
    if (useCancelableRequest) {
        await fileSystemHelpers.writeFile(resolveHelper(outputCorePath, 'CancelablePromise.ts'), templates.core.cancelablePromise({}));
    }
    await fileSystemHelpers.writeFile(resolveHelper(outputCorePath, 'HttpStatusCode.ts'), templates.core.httpStatusCode({}));
    await fileSystemHelpers.writeFile(resolveHelper(outputCorePath, 'request.ts'), templates.core.request(context));
    await fileSystemHelpers.writeFile(resolveHelper(outputCorePath, 'request-executor.ts'), templates.core.requestExecutor({}));
    // TODO: Добавлять только, если не выбран custom-ный request
    await fileSystemHelpers.writeFile(resolveHelper(outputCorePath, 'createExecutorAdapter.ts'), templates.core.createExecutorAdapter({ useCustomRequest: hasCustomRequest }));

    if (hasCustomRequest) {
        const requestFile = resolveHelper(process.cwd(), request);
        const requestFileExists = await fileSystemHelpers.exists(requestFile);
        if (!requestFileExists) {
            throw new Error(`Custom request file "${requestFile}" does not exists`);
        }
        await fileSystemHelpers.copyFile(requestFile, resolveHelper(outputCorePath, 'request.ts'));
    }

    this.logger.info("The writing of the kernel files has been completed successfully");
}
