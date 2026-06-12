import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { installSilenceLoggers } from '../../../test/helpers/silenceLoggers';
import { createSpecAnalysisAccumulator, finalizeSpecAnalysis } from '../runSpecAnalysis';
import { SpecFindingCategoryEnum } from '../types';

describe('@unit: finalizeSpecAnalysis failOnHigh', () => {
    test('throws after cross-spec when high severity findings exist', async () => {
        const restore = installSilenceLoggers();
        try {
            const accumulator = createSpecAnalysisAccumulator();
            accumulator.addPerSpecFindings([
                {
                    id: 'circular-1',
                    category: SpecFindingCategoryEnum.CircularSchemaRefs,
                    severity: 'high',
                    description: 'circular refs',
                },
            ]);

            await assert.rejects(
                () =>
                    finalizeSpecAnalysis(
                        accumulator,
                        [{ name: 'spec-a', input: './spec.json', outputModels: './models', outputSchemas: './schemas' }],
                        { enabled: true, failOnHigh: true, severity: 'low' },
                        { info: () => undefined, forceInfo: () => undefined } as never
                    ),
                /high-severity finding/i
            );
        } finally {
            restore();
        }
    });
});
