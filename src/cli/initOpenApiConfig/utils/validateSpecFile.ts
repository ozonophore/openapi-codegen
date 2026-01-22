import SwaggerParser from '@apidevtools/swagger-parser';

import { APP_LOGGER } from '../../../common/Consts';

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
        APP_LOGGER.warn(`Skipping invalid spec file: ${filePath}`);
        return false;
    }
}