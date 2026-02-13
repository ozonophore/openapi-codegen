import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { format } from '../../common/utils/format';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { Templates } from '../types/base/Templates.model';
import { Service } from '../types/shared/Service.model';
import { WriteClient } from '../WriteClient';

interface WriteClientExecutor {
    outputPath: string;
    outputCorePath: string;
    services: Service[];
    templates: Templates;
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
    const { outputPath, outputCorePath, templates, services } = options;
    const file = resolveHelper(outputPath, 'createClient.ts');
    const uniqueServices = deduplicateServicesByName(services);

    this.logger.info(`Началась запись файла ${file}`);
    const templateResult = templates.exports.client({
        outputCore: outputCorePath,
        services: uniqueServices,
    });
    const formattedValue = await format(templateResult);
    await fileSystemHelpers.writeFile(file, formattedValue);
    this.logger.info(`File recording completed: ${file}`);
}

export { deduplicateServicesByName };
