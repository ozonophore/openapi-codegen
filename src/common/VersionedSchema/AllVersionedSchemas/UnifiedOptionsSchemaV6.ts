import { z } from 'zod';

import { anomalyDetectionConfigSchemaOrBoolean, anomalyExploitationConfigSchemaOrBoolean, autoSelectConfigSchemaOrBoolean } from '../CommonSchemas';
import { unifiedItemSchema } from './UnifiedBase';
import { unifiedOptionsSchemaV5 } from './UnifiedOptionsSchemaV5';

/** Схема элемента `items[]` с per-item Marauder overrides (V6). */
export const unifiedItemSchemaV6 = unifiedItemSchema.extend({
    anomalyDetection: anomalyDetectionConfigSchemaOrBoolean.optional(),
    anomalyExploitation: anomalyExploitationConfigSchemaOrBoolean.optional(),
});

/** Корневая схема UNIFIED v6: Marauder-блоки на root и в `items[]`. */
export const unifiedOptionsSchemaV6 = unifiedOptionsSchemaV5.extend({
    autoSelect: autoSelectConfigSchemaOrBoolean.optional(),
    anomalyDetection: anomalyDetectionConfigSchemaOrBoolean.optional(),
    anomalyExploitation: anomalyExploitationConfigSchemaOrBoolean.optional(),
    items: z.array(unifiedItemSchemaV6).min(1).optional(),
});

/*
type TUnifiedV6 = TUnifiedV5 & {
    autoSelect?: {
        enabled?: boolean;
        strict?: boolean;
        preferSmallBundles?: boolean;
        preferStandards?: boolean;
    };
    anomalyDetection?: {
        enabled?: boolean;
        severity?: 'low' | 'medium' | 'high';
        reportFormat?: 'json' | 'markdown' | 'html';
        reportPath?: string;
    };
}
*/
