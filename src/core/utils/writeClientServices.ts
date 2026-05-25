import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { eslintFix } from '../../common/utils/eslintFix';
import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { format } from '../../common/utils/format';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { OutputPaths } from '../types/base/OutputPaths.model';
import { Templates } from '../types/base/Templates.model';
import { HttpClient } from '../types/enums/HttpClient.enum';
import type { Service } from '../types/shared/Service.model';
import { WriteClient } from '../WriteClient';

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
    useProjectPrettier?: boolean;
    useEslintFix?: boolean;
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
    const { services, templates, outputPaths, httpClient, useUnionTypes, useOptions, useCancelableRequest, useProjectPrettier, useEslintFix } = options;

    this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.SERVICES_START);

    for (const service of services) {
        const file = resolveHelper(outputPaths.outputServices, `${service.name}.ts`);

        this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.DATA_WRITE_START(file));

        const templateResult = templates.exports.service({
            ...service,
            httpClient,
            useUnionTypes,
            useOptions,
            outputCore: outputPaths.outputCore,
            outputModels: outputPaths.outputModels,
            useCancelableRequest,
        });
        const formattedValue = await format(templateResult, undefined, useProjectPrettier);
        await this.writeOutputFile(file, formattedValue);
        if (useEslintFix) {
            await eslintFix(file);
        }

        this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.FILE_RECORDED(file));
    }

    this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.SERVICES_FINISH);
}
