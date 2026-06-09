import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { format } from '../../common/utils/format';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { Templates } from '../types/base/Templates.model';
import { Service } from '../types/shared/Service.model';
import { WriteClient } from '../WriteClient';

interface WriteClientExecutor {
    outputPath: string;
    outputCorePath: string;
    request?: string;
    customExecutorPath?: string;
    services: Service[];
    templates: Templates;
    prettierConfigPath?: string;
}

function deduplicateServicesByName(services: Service[]): Service[] {
    const seen = new Set<string>();
    return services.filter(service => {
        if (seen.has(service.name)) {
            return false;
        }
        seen.add(service.name);
        return true;
    });
}

export async function writeClientExecutor(this: WriteClient, options: WriteClientExecutor): Promise<void> {
    const { outputPath, outputCorePath, templates, services, request, customExecutorPath, prettierConfigPath } = options;
    const file = resolveHelper(outputPath, 'createClient.ts');
    const uniqueServices = deduplicateServicesByName(services);
    const hasCustomRequest = !!request;

    this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.EXECUTOR_START(file));
    const templateResult = templates.exports.client({
        outputCore: outputCorePath,
        useCustomRequest: hasCustomRequest,
        customExecutorPath,
        services: uniqueServices,
    });
    const formattedValue = await format(templateResult, undefined, prettierConfigPath);
    await this.writeOutputFile(file, formattedValue);
    this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.FILE_RECORDED(file));
}

export { deduplicateServicesByName };
