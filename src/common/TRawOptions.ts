import { z } from 'zod';

import { flatOptionsSchema, rawOptionsSchema } from './VersionedSchema/AllVersionedSchemas/UnifiedVersionedSchemas';

export type TRawOptions = z.infer<typeof rawOptionsSchema>;

export type TFlatOptions = z.infer<typeof flatOptionsSchema>;

/**
 * Fully-resolved generation options for a single item.
 *
 * Path fields (`input`, `output`, `outputCore`, `outputModels`, `outputServices`,
 * `outputSchemas`, `request`, `customExecutorPath`, `prettierConfigPath`,
 * `governanceConfig`, `reportFile`, `plugins[].path`) are **always absolute** after
 * `normalizePathsToAbsolute` has been applied. Core functions must not call
 * `resolveHelper(process.cwd(), ...)` on these fields.
 */
export type TStrictFlatOptions = {
    [P in keyof TFlatOptions]-?: NonNullable<TFlatOptions[P]>;
};
