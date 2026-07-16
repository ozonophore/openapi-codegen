import { z } from 'zod';

import {
    anomalyDetectionConfigSchemaOrBoolean,
    autoSelectConfigSchemaOrBoolean,
    specAnalysisConfigSchemaOrBoolean,
    swarmConfigSchemaOrBoolean,
    trafficSplitterConfigSchemaOrBoolean,
    workspaceReportConfigSchemaOrBoolean,
} from '../CommonSchemas';
import { unifiedItemSchema } from './UnifiedBase';
import { unifiedOptionsSchemaV5 } from './UnifiedOptionsSchemaV5';

/** Схема элемента `items[]` с per-item Marauder overrides (V6). */
export const unifiedItemSchemaV6 = unifiedItemSchema.extend({
    specAnalysis: specAnalysisConfigSchemaOrBoolean.optional(),
    /** @deprecated Use specAnalysis instead. */
    anomalyDetection: anomalyDetectionConfigSchemaOrBoolean.optional(),
});

/** Корневая схема UNIFIED v6: Marauder-блоки на root и в `items[]`. */
export const unifiedOptionsSchemaV6 = unifiedOptionsSchemaV5.extend({
    autoSelect: autoSelectConfigSchemaOrBoolean.optional(),
    specAnalysis: specAnalysisConfigSchemaOrBoolean.optional(),
    /** @deprecated Use specAnalysis instead. */
    anomalyDetection: anomalyDetectionConfigSchemaOrBoolean.optional(),
    /** Swarm-lite: сводный отчёт по workspace (только root). */
    workspaceReport: workspaceReportConfigSchemaOrBoolean.optional(),
    /** Хелпер canary-миграции между двумя версиями клиента (только root). */
    trafficSplitter: trafficSplitterConfigSchemaOrBoolean.optional(),
    /** AvatarSwarm: машиночитаемая карта multi-spec системы (только root). */
    swarm: swarmConfigSchemaOrBoolean.optional(),
    /** Предгенерационный cross-spec анализ пересечений моделей (только root). */
    preAnalyze: z.boolean().optional(),
    /** Режим дедупликации при cacheStrategy: reuse (только root). */
    reuseMode: z.enum(['copy', 'auto-group']).optional(),
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
