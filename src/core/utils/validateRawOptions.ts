import { APP_LOGGER } from '../../common/Consts';
import { TRawOptions } from '../../common/TRawOptions';
import { validateZodOptions } from '../../common/Validation/validateZodOptions';
import { rawOptionsSchema } from '../../common/VersionedSchema/AllVersionedSchemas/UnifiedVersionedSchemas';
import { dependentOptionsRefinement } from '../../common/VersionedSchema/refinements/dependentOptionsRefinement';

export function validateRawOptions(rawOptions: TRawOptions) {
    const currentSchema = rawOptionsSchema.superRefine(dependentOptionsRefinement);

    const validationResult = validateZodOptions(currentSchema, rawOptions);

    if (!validationResult.success) {
        APP_LOGGER.error(validationResult.errors.join('\n'));
        process.exit(1);
    }
}
