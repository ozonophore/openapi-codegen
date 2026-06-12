import assert from 'node:assert';
import { afterEach, beforeEach, describe, test } from 'node:test';

import { installSilenceLoggers } from '../../../../test/helpers/silenceLoggers';
import { CodegenSpecAnalyzer } from '../../CodegenSpecAnalyzer';
import { SpecFindingCategoryEnum } from '../../types';

describe('@unit: detectAmbiguousModelName', () => {
    let restoreLoggers: (() => void) | undefined;

    beforeEach(() => {
        restoreLoggers = installSilenceLoggers();
    });

    afterEach(() => {
        restoreLoggers?.();
    });

    test('does not flag Ingredient when it is the only schema', () => {
        const spec = {
            openapi: '3.0.0',
            paths: {},
            components: {
                schemas: {
                    Ingredient: {
                        type: 'object',
                        properties: { name: { type: 'string' } },
                    },
                },
            },
        };

        const findings = new CodegenSpecAnalyzer().analyze(spec as any, { enabled: true, severity: 'low' });
        const ambiguous = findings.filter(finding => finding.category === SpecFindingCategoryEnum.AmbiguousModelName);

        assert.equal(ambiguous.length, 0);
    });

    test('flags different schema names that encode to the same generated model name', () => {
        const spec = {
            openapi: '3.0.0',
            paths: {},
            components: {
                schemas: {
                    'user-profile': {
                        type: 'object',
                        properties: { id: { type: 'string' } },
                    },
                    user_profile: {
                        type: 'object',
                        properties: { name: { type: 'string' } },
                    },
                },
            },
        };

        const findings = new CodegenSpecAnalyzer().analyze(spec as any, { enabled: true, severity: 'low' });
        const ambiguous = findings.find(finding => finding.category === SpecFindingCategoryEnum.AmbiguousModelName);

        assert.ok(ambiguous);
        assert.ok(ambiguous!.affectedPaths?.includes('user-profile'));
        assert.ok(ambiguous!.affectedPaths?.includes('user_profile'));
    });

    test('flags User and IUser when generated name collides with component name', () => {
        const spec = {
            openapi: '3.0.0',
            paths: {},
            components: {
                schemas: {
                    User: {
                        type: 'object',
                        properties: { id: { type: 'string' } },
                    },
                    IUser: {
                        type: 'object',
                        properties: { id: { type: 'string' } },
                    },
                },
            },
        };

        const findings = new CodegenSpecAnalyzer().analyze(spec as any, { enabled: true, severity: 'low' });
        const ambiguous = findings.find(finding => finding.category === SpecFindingCategoryEnum.AmbiguousModelName);

        assert.ok(ambiguous);
        assert.ok(ambiguous!.affectedPaths?.includes('User'));
        assert.ok(ambiguous!.affectedPaths?.includes('IUser'));
    });

    test('respects custom prefixes', () => {
        const spec = {
            openapi: '3.0.0',
            paths: {},
            components: {
                schemas: {
                    User: {
                        type: 'object',
                        properties: { id: { type: 'string' } },
                    },
                    XUser: {
                        type: 'object',
                        properties: { id: { type: 'string' } },
                    },
                },
            },
        };

        const findings = new CodegenSpecAnalyzer().analyze(spec as any, { enabled: true, severity: 'low' }, undefined, {
            interface: 'X',
            enum: 'E',
            type: 'T',
        });
        const ambiguous = findings.find(finding => finding.category === SpecFindingCategoryEnum.AmbiguousModelName);

        assert.ok(ambiguous);
        assert.ok(ambiguous!.affectedPaths?.includes('User'));
        assert.ok(ambiguous!.affectedPaths?.includes('XUser'));
    });

    test('does not flag schemas when prefixes are empty', () => {
        const spec = {
            openapi: '3.0.0',
            paths: {},
            components: {
                schemas: {
                    User: {
                        type: 'object',
                        properties: { id: { type: 'string' } },
                    },
                    IUser: {
                        type: 'object',
                        properties: { id: { type: 'string' } },
                    },
                },
            },
        };

        const findings = new CodegenSpecAnalyzer().analyze(spec as any, { enabled: true, severity: 'low' }, undefined, {
            interface: '',
            enum: '',
            type: '',
        });
        const ambiguous = findings.filter(finding => finding.category === SpecFindingCategoryEnum.AmbiguousModelName);

        assert.equal(ambiguous.length, 0);
    });
});
