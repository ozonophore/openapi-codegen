import { confirmDialog } from "..//interactive/confirmDialog";
import { initConfig } from "./initConfig";
import { initCustomRequest } from "./initCustomRequest";
import { registerHandlebarTemplates } from "./utils/registerHandlebarTemplates";

type InitParams = {
    openapiConfig: string;
    specDir: string;
    useCancelableRequest?: boolean;
}

/**
 * TODO: интеррактивность по флагу! Выполнение команды в зависимости от вкл/выкл интеррактивности
 */
export async function init(params: InitParams) {
    const templates = registerHandlebarTemplates();
    const shouldInitConfig = await confirmDialog({
        message: "Желаете сформировать конфигурационный файл для быстрого запуска генератора?",
        initial: false,
    });
    if (shouldInitConfig) {
        // TODO: генерация по шаблону!
        await initConfig(params.openapiConfig, params.specDir, templates);
    }

    const shouldInitCustomRequest = await confirmDialog({
        message: "Желаете сформировать файл с пользовательским вариантом обработки запросов?",
        initial: false,
    });

    if (shouldInitCustomRequest) {
        await initCustomRequest(templates, params?.useCancelableRequest);
    }
}