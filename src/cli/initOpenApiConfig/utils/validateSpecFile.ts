import SwaggerParser from '@apidevtools/swagger-parser';

import { APP_LOGGER } from '../../../common/Consts';
import { LOGGER_MESSAGES } from '../../../common/LoggerMessages';

/**
 * Валидирует файл спецификации через SwaggerParser
 * @param filePath - Путь к файлу спецификации
 * @returns true, если файл валиден, false в противном случае
 */
export async function validateSpecFile(filePath: string): Promise<boolean> {
    try {
        await SwaggerParser.validate(filePath);
        return true;
    } catch {
        APP_LOGGER.warn(LOGGER_MESSAGES.SPEC_VALIDATION.SKIP_INVALID_FILE(filePath));
        return false;
    }
}
