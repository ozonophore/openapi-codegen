import { z } from 'zod';

import { anomalyDetectionConfigSchemaOrBoolean, anomalyExploitationConfigSchemaOrBoolean } from '../../common/VersionedSchema/CommonSchemas';
import { emptyStringToUndefined } from './base';

const swarmOptionsBaseSchema = z
    .object({
        specsDir: emptyStringToUndefined,
        specs: emptyStringToUndefined,
        output: z.string().min(1, 'output is required'),
        strategy: z.enum(['consensus', 'voting', 'hierarchical']).optional().default('consensus'),
        consensusThreshold: z.coerce.number().min(0).max(1).optional().default(0.66),
        enableHealthMonitoring: z.boolean().optional().default(true),
        enablePerformanceProfiling: z.boolean().optional().default(true),
        enableAutoOptimization: z.boolean().optional().default(true),
        aiRecommendations: z.boolean().optional().default(true),
        reportFormat: z.enum(['json', 'markdown', 'html', 'all']).optional().default('markdown'),
        generateApiServer: z.boolean().optional().default(false),
        apiServerPort: z.coerce.number().int().positive().optional().default(3100),
        anomalyDetection: anomalyDetectionConfigSchemaOrBoolean.optional(),
        anomalyExploitation: anomalyExploitationConfigSchemaOrBoolean.optional(),
        exploitAnomalies: z.boolean().optional(),
    })
    .refine(data => Boolean(data.specsDir || data.specs), {
        message: 'Either specsDir or specs is required',
        path: ['specsDir'],
    });

export const swarmSchema = swarmOptionsBaseSchema.transform(data => {
    const { exploitAnomalies, ...rest } = data;
    let anomalyDetection = rest.anomalyDetection;
    let anomalyExploitation = rest.anomalyExploitation;

    if (exploitAnomalies) {
        anomalyExploitation = { ...(anomalyExploitation ?? {}), enabled: true };
        anomalyDetection = { ...(anomalyDetection ?? {}), enabled: true };
    }

    return {
        ...rest,
        anomalyDetection,
        anomalyExploitation,
    };
});

export type TSwarmOptions = z.infer<typeof swarmSchema>;
