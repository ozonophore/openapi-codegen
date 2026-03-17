import { APP_LOGGER } from '../../common/Consts';
import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { TRawOptions } from '../../common/TRawOptions';
import { validateZodOptions } from '../../common/Validation/validateZodOptions';
import { rawOptionsSchema } from '../../common/VersionedSchema/AllVersionedSchemas/UnifiedVersionedSchemas';
import { dependentOptionsRefinement } from '../../common/VersionedSchema/refinements/dependentOptionsRefinement';

export async function validateRawOptions(rawOptions: TRawOptions): Promise<void> {
    const currentSchema = rawOptionsSchema.superRefine(dependentOptionsRefinement);

    const validationResult = validateZodOptions(currentSchema, rawOptions);

    if (!validationResult.success) {
        APP_LOGGER.error(LOGGER_MESSAGES.ERROR.GENERIC(validationResult.errors.join('\n')));
        await APP_LOGGER.shutdownLoggerAsync();
        process.exit(1);
    }
}
