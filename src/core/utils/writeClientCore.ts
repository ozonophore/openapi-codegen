import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { buildCoreTransportFingerprint, detectCustomRequestRaw } from '../reuseStore/coreTransportFingerprint';
import type { SharedFolderWriter } from '../reuseStore/SharedFolderWriter';
import { writeSharedOrLocalCoreFile } from '../reuseStore/writeSharedCoreFile';
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
    sharedFolderWriter?: SharedFolderWriter;
}

/**
 * Generate OpenAPI core files, this includes the basic boilerplate code to handle requests.
 */
export async function writeClientCore(this: WriteClient, options: IWriteClientCore): Promise<void> {
    const { client, templates, outputCorePath, httpClient, request, useCancelableRequest, useSeparatedIndexes, customExecutorPath, modelsMode, sharedFolderWriter } = options;
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
    let customRequestContent: string | undefined;
    let customExecutorContent: string | undefined;

    if (hasCustomRequest) {
        const requestFile = resolveHelper(process.cwd(), request);
        const requestFileExists = await fileSystemHelpers.exists(requestFile);
        if (!requestFileExists) {
            throw new Error(`Custom request file "${requestFile}" does not exists`);
        }
        customRequestContent = await fileSystemHelpers.readFile(requestFile, 'utf8');
        useCustomRequestRaw = detectCustomRequestRaw(customRequestContent);
    }

    if (hasCustomExecutor) {
        const executorFile = resolveHelper(process.cwd(), customExecutorPath);
        const executorFileExists = await fileSystemHelpers.exists(executorFile);
        if (!executorFileExists) {
            throw new Error(`Custom executor file "${executorFile}" does not exists`);
        }
        customExecutorContent = await fileSystemHelpers.readFile(executorFile, 'utf8');
    }

    const transportFingerprint = buildCoreTransportFingerprint({
        request,
        customExecutorPath,
        httpClient,
        useCancelableRequest,
        useCustomRequestRaw,
    });

    const writeCore = async (relativeCorePath: string, content: string) => {
        await writeSharedOrLocalCoreFile(this, {
            sharedFolderWriter,
            outputCorePath,
            relativeCorePath,
            content,
            transportFingerprint,
        });
    };

    await writeCore('OpenAPI.ts', templates.core.settings(context));
    await writeCore('ApiError.ts', templates.core.apiError({}));
    await writeCore('ApiRequestOptions.ts', templates.core.apiRequestOptions({}));
    await writeCore('ApiResult.ts', templates.core.apiResult({}));
    if (modelsMode === ModelsMode.CLASSES) {
        await writeCore('BaseDto.ts', templates.core.baseDto({}));
        await writeCore('dtoUtils.ts', templates.core.dtoUtils({}));
    }
    if (useCancelableRequest) {
        await writeCore('CancelablePromise.ts', templates.core.cancelablePromise({}));
    }
    await writeCore('HttpStatusCode.ts', templates.core.httpStatusCode({}));
    await writeCore('request.ts', hasCustomRequest && customRequestContent !== undefined ? customRequestContent : templates.core.request(context));
    await writeCore('executor/requestExecutor.ts', templates.core.requestExecutor({ useCancelableRequest }));
    await writeCore('executor/createExecutorAdapter.ts', hasCustomExecutor && customExecutorContent !== undefined ? customExecutorContent : templates.core.createExecutorAdapter({}));
    await writeCore('executor/legacyRequestAdapter.ts', templates.core.legacyRequestAdapter({ useCustomRequestRaw }));
    await writeCore('interceptors/interceptors.ts', templates.core.interceptors({}));
    await writeCore('interceptors/apiErrorInterceptor.ts', templates.core.apiErrorInterceptor({}));
    await writeCore('interceptors/withInterceptors.ts', templates.core.withInterceptors({}));

    this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.CORE_FINISH);
}
