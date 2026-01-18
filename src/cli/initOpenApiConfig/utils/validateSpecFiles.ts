import { relativeHelper } from '../../../common/utils/pathHelpers';
import { validateSpecFile } from './validateSpecFile';

export interface ValidatedSpec {
    path: string;
    relativePath: string;
}

/**
 * Валидирует все файлы спецификаций
 * @param specFiles - Массив путей к файлам спецификаций
 * @returns Массив валидированных спецификаций с относительными путями
 */
export async function validateSpecFiles(specFiles: string[]): Promise<ValidatedSpec[]> {
    const validatedSpecs: ValidatedSpec[] = [];

    for (const specFile of specFiles) {
        const isValid = await validateSpecFile(specFile);
        if (isValid) {
            const relativePath = relativeHelper(process.cwd(), specFile);
            validatedSpecs.push({
                path: specFile,
                relativePath,
            });
        }
    }

    return validatedSpecs;
}