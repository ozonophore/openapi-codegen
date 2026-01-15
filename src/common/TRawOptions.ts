import { z } from 'zod';

import { flatOptionsSchema, rawOptionsSchema } from "./schemas/configSchemas";

export type TRawOptions = z.infer<typeof rawOptionsSchema>;

export type TFlatOptions = z.infer<typeof flatOptionsSchema>;

export type TStrictFlatOptions = {
    [P in keyof TFlatOptions]-?: NonNullable<TFlatOptions[P]>;
};
