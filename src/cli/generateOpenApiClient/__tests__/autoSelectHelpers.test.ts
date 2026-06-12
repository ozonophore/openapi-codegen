import assert from 'node:assert';
import path from 'node:path';
import { describe, test } from 'node:test';

import { Logger } from '../../../common/Logger';
import { AutoSelector } from '../../../core/autoSelect';
import { HttpClient } from '../../../core/types/enums/HttpClient.enum';
import { ValidationLibrary } from '../../../core/types/enums/ValidationLibrary.enum';
import { executeAutoSelection, resolveAutoSelectProbeOptions, resolveProjectAnalysisDir } from '../autoSelectHelpers';

describe('@unit: autoSelectHelpers', () => {
    test('resolveProjectAnalysisDir prefers output directory', () => {
        const targetDir = resolveProjectAnalysisDir({
            input: './specs/api.yaml',
            output: './generated/client',
        } as any);

        assert.equal(targetDir, path.resolve(process.cwd(), './generated/client'));
    });

    test('resolveProjectAnalysisDir uses cwd for URL input without output', () => {
        const targetDir = resolveProjectAnalysisDir({
            input: 'https://example.com/openapi.yaml',
        } as any);

        assert.equal(targetDir, process.cwd());
    });

    test('resolveAutoSelectProbeOptions uses first item when root output is missing', () => {
        const probe = resolveAutoSelectProbeOptions({
            httpClient: 'fetch',
            items: [
                { input: './specs/a.yaml', output: './out-a' },
                { input: './specs/b.yaml', output: './out-b' },
            ],
        } as any);

        assert.equal(probe.input, './specs/a.yaml');
        assert.equal(probe.output, './out-a');
        assert.equal(probe.httpClient, 'fetch');
    });

    test('resolveAutoSelectProbeOptions prefers root input and output when present', () => {
        const probe = resolveAutoSelectProbeOptions({
            input: './root.yaml',
            output: './root-out',
            items: [{ input: './specs/a.yaml', output: './out-a' }],
        } as any);

        assert.equal(probe.input, './root.yaml');
        assert.equal(probe.output, './root-out');
    });

    test('executeAutoSelection warns when multi-item outputs get different recommendations', () => {
        const originalSelectOptimal = AutoSelector.prototype.selectOptimal;
        let callIndex = 0;

        AutoSelector.prototype.selectOptimal = function patchedSelectOptimal() {
            callIndex += 1;
            if (callIndex === 1) {
                return {
                    validator: ValidationLibrary.ZOD,
                    httpClient: HttpClient.FETCH,
                    explanations: [],
                    recommendations: [],
                };
            }

            return {
                validator: ValidationLibrary.JOI,
                httpClient: HttpClient.AXIOS,
                explanations: [],
                recommendations: [],
            };
        };

        const warnings: string[] = [];
        const logger = {
            info: () => undefined,
            warn: (message: string) => {
                warnings.push(message);
            },
        } as unknown as Logger;

        try {
            const result = executeAutoSelection(
                {
                    autoSelect: { enabled: true },
                    items: [
                        { input: './specs/a.yaml', output: './out-a' },
                        { input: './specs/b.yaml', output: './out-b' },
                    ],
                } as any,
                logger
            );

            assert.ok(Array.isArray(result.items));
            assert.equal((result.items[0] as any).validationLibrary, ValidationLibrary.ZOD);
            assert.equal((result.items[0] as any).httpClient, HttpClient.FETCH);
            assert.equal((result.items[1] as any).validationLibrary, ValidationLibrary.JOI);
            assert.equal((result.items[1] as any).httpClient, HttpClient.AXIOS);
            assert.ok(warnings.some(message => message.includes('differ across output directories')));
            assert.ok(warnings.some(message => message.includes('./out-a')));
            assert.ok(warnings.some(message => message.includes('./out-b')));
        } finally {
            AutoSelector.prototype.selectOptimal = originalSelectOptimal;
        }
    });
});
