import assert from 'node:assert';
import { afterEach, beforeEach, describe, test } from 'node:test';

import { installSilenceLoggers } from '../../../test/helpers/silenceLoggers';
import { CodegenSpecAnalyzer } from '../CodegenSpecAnalyzer';
import { SpecFindingCategoryEnum } from '../types';

describe('@unit: CodegenSpecAnalyzer', () => {
    let restoreLoggers: (() => void) | undefined;

    beforeEach(() => {
        restoreLoggers = installSilenceLoggers();
    });

    afterEach(() => {
        restoreLoggers?.();
    });

    test('detects circular schema references', () => {
        const spec = {
            openapi: '3.0.0',
            paths: {},
            components: {
                schemas: {
                    NodeA: { $ref: '#/components/schemas/NodeB' },
                    NodeB: { $ref: '#/components/schemas/NodeA' },
                },
            },
        };

        const findings = new CodegenSpecAnalyzer().analyze(spec as any, { enabled: true, severity: 'low' });
        const circular = findings.find(finding => finding.category === SpecFindingCategoryEnum.CircularSchemaRefs);

        assert.ok(circular);
        assert.equal(circular!.severity, 'high');
        assert.ok(circular!.affectedPaths?.some(path => path.includes('NodeA')));
    });

    test('detects deeply nested schemas above configured depth', () => {
        const spec = {
            openapi: '3.0.0',
            paths: {},
            components: {
                schemas: {
                    Deep: {
                        type: 'object',
                        properties: {
                            level1: {
                                type: 'object',
                                properties: {
                                    level2: {
                                        type: 'object',
                                        properties: {
                                            level3: { type: 'string' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        };

        const findings = new CodegenSpecAnalyzer().analyze(spec as any, {
            enabled: true,
            severity: 'low',
            maxNestingDepth: 1,
        });
        const deep = findings.find(finding => finding.category === SpecFindingCategoryEnum.DeeplyNestedSchema);

        assert.ok(deep);
        assert.ok(deep!.affectedPaths?.some(path => path.includes('Deep')));
    });
});
