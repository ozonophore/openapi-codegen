import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, test } from 'node:test';

import { HttpClient } from '../../types/enums/HttpClient.enum';
import { ValidationLibrary } from '../../types/enums/ValidationLibrary.enum';
import { AutoSelector } from '../AutoSelector';
import { DEFAULT_DETECTION_RULES } from '../detection/defaultDetectionRules';
import { createPackageJsonContext } from '../detection/helpers';
import { runDetectionRules } from '../detection/runDetectionRules';
import type { DetectionRule, PackageJsonContext } from '../detection/types';
import type { ProjectAnalysis } from '../types';

function analyzePackageJson(packageJson: Record<string, unknown>): ProjectAnalysis {
    const ctx = createPackageJsonContext('/tmp/project', packageJson);
    return runDetectionRules(ctx, DEFAULT_DETECTION_RULES);
}

describe('@unit: AutoSelector detection rules', () => {
    const tempDirs: string[] = [];

    afterEach(() => {
        for (const dir of tempDirs.splice(0)) {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    test('detects react-native target and small bundle requirements', () => {
        const analysis = analyzePackageJson({
            dependencies: { 'react-native': '0.74.0' },
        });

        assert.strictEqual(analysis.deploymentTarget, 'react-native');
        assert.strictEqual(analysis.performanceRequirements.isMobileTarget, true);
        assert.strictEqual(analysis.performanceRequirements.requiresSmallBundle, true);
    });

    test('detects vercel edge performance signal', () => {
        const analysis = analyzePackageJson({
            devDependencies: { vercel: '33.0.0' },
        });

        assert.strictEqual(analysis.performanceRequirements.isEdgeFunction, true);
        assert.strictEqual(analysis.deploymentTarget, 'unknown');
    });

    test('detects browser target from react dependency', () => {
        const analysis = analyzePackageJson({
            dependencies: { react: '18.2.0' },
        });

        assert.strictEqual(analysis.deploymentTarget, 'browser');
    });

    test('detects nodejs target from engines.node', () => {
        const analysis = analyzePackageJson({
            engines: { node: '>=18' },
        });

        assert.strictEqual(analysis.deploymentTarget, 'nodejs');
    });

    test('detects edge deployment from serverless deps', () => {
        const analysis = analyzePackageJson({
            devDependencies: { '@vercel/functions': '1.0.0' },
        });

        assert.strictEqual(analysis.deploymentTarget, 'edge');
        assert.strictEqual(analysis.performanceRequirements.isEdgeFunction, false);
    });

    test('react-native wins over react browser detection', () => {
        const analysis = analyzePackageJson({
            dependencies: {
                'react-native': '0.74.0',
                react: '18.2.0',
            },
        });

        assert.strictEqual(analysis.deploymentTarget, 'react-native');
    });

    test('detects existing validators and http clients', () => {
        const analysis = analyzePackageJson({
            dependencies: {
                zod: '3.0.0',
                axios: '1.6.0',
            },
        });

        assert.deepStrictEqual(analysis.packageJson.existingValidators, [ValidationLibrary.ZOD]);
        assert.deepStrictEqual(analysis.packageJson.existingHttpClients, [HttpClient.AXIOS]);
    });

    test('detects bundler and tree-shaking metadata', () => {
        const analysis = analyzePackageJson({
            sideEffects: false,
            devDependencies: { vite: '5.0.0' },
        });

        assert.strictEqual(analysis.bundleSize.hasTreeShaking, true);
        assert.strictEqual(analysis.bundleSize.hasBundler, true);
        assert.strictEqual(analysis.bundleSize.bundlerType, 'vite');
    });

    test('supports custom detection rules appended to defaults', () => {
        class ExpoRule implements DetectionRule {
            readonly id = 'expo';

            apply(ctx: PackageJsonContext, analysis: ProjectAnalysis): void {
                if (ctx.allDeps.expo) {
                    analysis.performanceRequirements.isMobileTarget = true;
                    analysis.deploymentTarget = 'react-native';
                }
            }
        }

        const analysis = runDetectionRules(createPackageJsonContext('/tmp/project', { dependencies: { expo: '51.0.0' } }), [...DEFAULT_DETECTION_RULES, new ExpoRule()]);

        assert.strictEqual(analysis.deploymentTarget, 'react-native');
        assert.strictEqual(analysis.performanceRequirements.isMobileTarget, true);
    });

    test('selectOptimal uses detection rules from project directory', () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'auto-select-'));
        tempDirs.push(dir);

        fs.writeFileSync(
            path.join(dir, 'package.json'),
            JSON.stringify({
                dependencies: { react: '18.2.0', zod: '3.0.0' },
            })
        );

        const result = new AutoSelector().selectOptimal(dir);

        assert.strictEqual(result.httpClient, HttpClient.FETCH);
        assert.strictEqual(result.validator, ValidationLibrary.ZOD);
    });

    test('selectOptimal accepts custom detection rules via config', () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'auto-select-custom-'));
        tempDirs.push(dir);

        fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'plain-node-service' }));

        class ForceNodeRule implements DetectionRule {
            readonly id = 'force-node';

            apply(_ctx: PackageJsonContext, analysis: ProjectAnalysis): void {
                analysis.deploymentTarget = 'nodejs';
            }
        }

        const result = new AutoSelector().selectOptimal(dir, { detectionRules: [new ForceNodeRule()] });

        assert.strictEqual(result.httpClient, HttpClient.NODE);
    });
});
