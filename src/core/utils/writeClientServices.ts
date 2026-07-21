import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { format } from '../../common/utils/format';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { OutputPaths } from '../types/base/OutputPaths.model';
import { Templates } from '../types/base/Templates.model';
import { HttpClient } from '../types/enums/HttpClient.enum';
import { ModelsLayout } from '../types/enums/ModelsLayout.enum';
import { ModelsMode } from '../types/enums/ModelsMode.enum';
import type { Service } from '../types/shared/Service.model';
import { WriteClient } from '../WriteClient';

type TServeceOutputsPath = Omit<OutputPaths, 'output' | 'outputSchemas'>;

/**
 * Параметры записи сервисов клиента.
 * @property services список сервисов для записи
 * @property templates загруженные Handlebars-шаблоны
 * @property outputPaths пути выходных директорий сервисов
 * @property httpClient выбранный HTTP-клиент
 * @property useUnionTypes использовать union types вместо enum
 * @property useOptions использовать options-функции вместо аргументов
 * @property useCancelableRequest использовать cancelable request type
 * @property [modelsMode] режим генерации моделей
 * @property [modelsLayout] раскладка файлов моделей для classes mode
 * @property [prettierConfigPath] путь к конфигу Prettier
 */
interface IWriteClientServices {
    services: Service[];
    templates: Templates;
    outputPaths: TServeceOutputsPath;
    httpClient: HttpClient;
    useUnionTypes: boolean;
    useOptions: boolean;
    useCancelableRequest: boolean;
    modelsMode?: ModelsMode;
    modelsLayout?: ModelsLayout;
    prettierConfigPath?: string;
}

/**
 * Генерирует сервисы по Handlebars-шаблону и записывает их на диск.
 * @param options параметры записи сервисов
 */
export async function writeClientServices(this: WriteClient, options: IWriteClientServices): Promise<void> {
    const { services, templates, outputPaths, httpClient, useUnionTypes, useOptions, useCancelableRequest, modelsMode, modelsLayout, prettierConfigPath } = options;

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
            modelsMode,
            modelsLayout,
        });
        const formattedValue = await format(templateResult, undefined, prettierConfigPath);
        await this.writeOutputFile(file, formattedValue);
        this.registerLintTarget(file, outputPaths.outputServices);

        this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.FILE_RECORDED(file));
    }

    this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.SERVICES_FINISH);
}
