import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { Templates } from '../types/base/Templates.model';
import { HttpClient } from '../types/enums/HttpClient.enum';
import { ModelsMode } from '../types/enums/ModelsMode.enum';
import type { Client } from '../types/shared/Client.model';
import { WriteClient } from '../WriteClient';

/**
 * @param client Client object, containing, models, schemas and services
 * @param templates The loaded handlebar templates
 * @param outputCorePath The directory for generating the kernel settings
 * @param httpClient The selected httpClient (fetch, xhr or node)
 * @param request: Path to custom request file
 * @param customExecutorPath: Path to custom executor file
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
    customExecutorPath?: string;
    modelsMode?: ModelsMode;
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
    const { client, templates, outputCorePath, httpClient, request, useCancelableRequest, useSeparatedIndexes, customExecutorPath, modelsMode } = options;
    const context = {
        httpClient,
        server: client.server,
        version: client.version,
        useCancelableRequest,
        useSeparatedIndexes,
    };

    this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.CORE_START);

    const hasCustomRequest = !!request;
    const hasCustomExecutor = !!customExecutorPath;
    let useCustomRequestRaw = false;

    if (hasCustomRequest) {
        const requestFile = resolveHelper(process.cwd(), request);
        const requestFileExists = await fileSystemHelpers.exists(requestFile);
        if (!requestFileExists) {
            throw new Error(`Custom request file "${requestFile}" does not exists`);
        }
        const requestFileContent = await fileSystemHelpers.readFile(requestFile, 'utf8');
        useCustomRequestRaw = /\bexport\s+(async\s+)?function\s+requestRaw\b/.test(requestFileContent);
    }

    if (hasCustomExecutor) {
        const executorFile = resolveHelper(process.cwd(), customExecutorPath);
        const executorFileExists = await fileSystemHelpers.exists(executorFile);
        if (!executorFileExists) {
            throw new Error(`Custom executor file "${executorFile}" does not exists`);
        }
    }

    await this.writeOutputFile(resolveHelper(outputCorePath, 'OpenAPI.ts'), templates.core.settings(context));
    await this.writeOutputFile(resolveHelper(outputCorePath, 'ApiError.ts'), templates.core.apiError({}));
    await this.writeOutputFile(resolveHelper(outputCorePath, 'ApiRequestOptions.ts'), templates.core.apiRequestOptions({}));
    await this.writeOutputFile(resolveHelper(outputCorePath, 'ApiResult.ts'), templates.core.apiResult({}));
    if (modelsMode === ModelsMode.CLASSES) {
        await this.writeOutputFile(resolveHelper(outputCorePath, 'BaseDto.ts'), templates.core.baseDto({}));
        await this.writeOutputFile(resolveHelper(outputCorePath, 'dtoUtils.ts'), templates.core.dtoUtils({}));
    }
    if (useCancelableRequest) {
        await this.writeOutputFile(resolveHelper(outputCorePath, 'CancelablePromise.ts'), templates.core.cancelablePromise({}));
    }
    await this.writeOutputFile(resolveHelper(outputCorePath, 'HttpStatusCode.ts'), templates.core.httpStatusCode({}));
    await this.writeOutputFile(resolveHelper(outputCorePath, 'request.ts'), templates.core.request(context));
    await this.writeOutputFile(resolveHelper(outputCorePath, 'executor/requestExecutor.ts'), templates.core.requestExecutor({ useCancelableRequest }));
    await this.writeOutputFile(resolveHelper(outputCorePath, 'executor/createExecutorAdapter.ts'), templates.core.createExecutorAdapter({}));
    await this.writeOutputFile(resolveHelper(outputCorePath, 'executor/legacyRequestAdapter.ts'), templates.core.legacyRequestAdapter({ useCustomRequestRaw }));
    await this.writeOutputFile(resolveHelper(outputCorePath, 'interceptors/interceptors.ts'), templates.core.interceptors({}));
    await this.writeOutputFile(resolveHelper(outputCorePath, 'interceptors/apiErrorInterceptor.ts'), templates.core.apiErrorInterceptor({}));
    await this.writeOutputFile(resolveHelper(outputCorePath, 'interceptors/withInterceptors.ts'), templates.core.withInterceptors({}));

    if (hasCustomRequest) {
        const requestFile = resolveHelper(process.cwd(), request);
        await fileSystemHelpers.copyFile(requestFile, resolveHelper(outputCorePath, 'request.ts'));
        this.registerOutputFile(resolveHelper(outputCorePath, 'request.ts'));
    }

    if (hasCustomExecutor) {
        const executorFile = resolveHelper(process.cwd(), customExecutorPath);
        await fileSystemHelpers.copyFile(executorFile, resolveHelper(outputCorePath, 'executor/createExecutorAdapter.ts'));
        this.registerOutputFile(resolveHelper(outputCorePath, 'executor/createExecutorAdapter.ts'));
    }

    this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.CORE_FINISH);
}
