import { z } from 'zod';

import { emptyStringToUndefined } from './base';

export const migrateSchema = z.object({
    fromClient: z.string().describe('Current client name (e.g., "axios-client")'),
    toClient: z.string().describe('Target client name (e.g., "fetch-client")'),
    strategy: z.enum(['canary', 'blue-green', 'shadow', 'staged']).optional().default('canary').describe('Migration strategy to use'),
    phaseCount: z.coerce.number().int().min(2).max(10).optional().default(4).describe('Number of migration phases'),
    phaseDuration: z.string().optional().default('1h').describe('Duration of each phase (e.g., "1h", "30m")'),
    checkpointFrequency: z.string().optional().default('15m').describe('How often to check phase success'),
    rollbackThreshold: z.coerce.number().int().min(1).max(100).optional().default(5).describe('Error rate threshold (%) to trigger rollback'),
    enableMonitoring: z.boolean().optional().default(true).describe('Enable monitoring during migration'),
    enableMetrics: z.boolean().optional().default(true).describe('Collect detailed metrics'),
    diffReport: emptyStringToUndefined.describe('Path to analyze-diff report JSON for breaking-change-aware planning'),
    outputFile: z.string().optional().describe('Path to save migration plan JSON'),
    generateGuide: z.boolean().optional().default(true).describe('Generate detailed migration guide'),
    guidePath: z.string().optional().describe('Path to save migration guide (default: ./MIGRATION_GUIDE.md)'),
    runtimeHelperPath: z.string().optional().describe('Path to save migration runtime helper TypeScript file'),
    format: z.enum(['json', 'markdown']).optional().default('markdown').describe('Output format'),
});

export type TMigrateOptions = z.infer<typeof migrateSchema>;
