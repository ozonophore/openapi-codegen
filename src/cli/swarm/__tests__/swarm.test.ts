import assert from 'node:assert';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, mock, test, type TestContext } from 'node:test';

import type { AnomalyReport } from '../../../core/analysis/types';
import { installSilenceLoggers } from '../../../test/helpers/silenceLoggers';

async function importSwarm() {
    return import('../swarm');
}

function createMockAnomalyReport(): AnomalyReport {
    return {
        timestamp: new Date().toISOString(),
        specVersion: '3.0.0',
        totalAnomalies: 1,
        criticalAnomalies: 0,
        anomalies: [
            {
                id: 'batch-users',
                type: 'batch-endpoints-available',
                severity: 'medium',
                description: 'Batch endpoint detected',
                benefitCategory: 'Performance',
                estimatedBenefit: '10x throughput',
            },
        ],
        summary: {
            estimatedPerformanceGain: '10x',
            bundleSizeImpact: 'none',
            mainThrottlingPoints: [],
            opportunitiesCount: 1,
            implementationEffort: 'low',
        },
        recommendations: [],
    };
}

function createTempDir(t: TestContext, prefix: string): string {
    const generatedRoot = path.join(__dirname, 'generated');
    mkdirSync(generatedRoot, { recursive: true });
    const tempDir = mkdtempSync(path.join(generatedRoot, prefix));
    t.after(() => {
        rmSync(tempDir, { recursive: true, force: true });
    });
    return tempDir;
}

function createMinimalOpenApiSpec(title: string, pathKey: string, operationId: string): Record<string, unknown> {
    return {
        openapi: '3.0.0',
        info: {
            title,
            version: '1.0.0',
        },
        paths: {
            [pathKey]: {
                get: {
                    operationId,
                    responses: {
                        '200': {
                            description: 'OK',
                        },
                    },
                },
            },
        },
    };
}

function writeSpecsDir(specsDir: string): void {
    writeFileSync(path.join(specsDir, 'users.json'), JSON.stringify(createMinimalOpenApiSpec('Users API', '/users', 'listUsers'), null, 2));
    writeFileSync(path.join(specsDir, 'orders.json'), JSON.stringify(createMinimalOpenApiSpec('Orders API', '/orders', 'listOrders'), null, 2));
}

describe('@unit: swarm', () => {
    let restoreLoggers: (() => void) | undefined;

    beforeEach(() => {
        restoreLoggers = installSilenceLoggers();
    });

    afterEach(() => {
        restoreLoggers?.();
        restoreLoggers = undefined;
    });

    test('calls runAnomalyDetection per avatar when enableAutoOptimization is enabled', async t => {
        const tempDir = createTempDir(t, 'swarm-anomaly-');
        const specsDir = path.join(tempDir, 'specs');
        const outputDir = path.join(tempDir, 'output');
        mkdirSync(specsDir, { recursive: true });
        writeSpecsDir(specsDir);

        const detectionCalls: Array<{ reportPath: string | undefined }> = [];
        let exploitationCallCount = 0;

        mock.module('../../../core/analysis/runAnomalyDetection', {
            namedExports: {
                runAnomalyDetection: async (_spec: unknown, config: { reportPath?: string }) => {
                    detectionCalls.push({ reportPath: config.reportPath });
                    return createMockAnomalyReport();
                },
            },
        });
        mock.module('../../../core/analysis/runAnomalyExploitation', {
            namedExports: {
                runAnomalyExploitation: async () => {
                    exploitationCallCount += 1;
                    return {
                        opportunities: [],
                        selectedCategories: ['batch-requests'],
                        generatedCode: {},
                        integrationGuide: '',
                        estimatedPerformanceGain: '10x',
                    };
                },
            },
        });

        const { swarm } = await importSwarm();
        await swarm({
            specsDir,
            output: outputDir,
            reportFormat: 'json',
            enableHealthMonitoring: true,
            enablePerformanceProfiling: false,
            enableAutoOptimization: true,
            aiRecommendations: false,
        });

        assert.strictEqual(detectionCalls.length, 2);
        const expectedReportPaths = ['users', 'orders'].map(name => path.resolve(path.join(outputDir, name, 'anomaly-report.json')));
        assert.deepStrictEqual(detectionCalls.map(call => path.resolve(call.reportPath ?? '')).sort(), expectedReportPaths.sort());
        assert.strictEqual(exploitationCallCount, 2);
    });

    test('generates coordinator, avatars, and client files from specs directory', async t => {
        const tempDir = createTempDir(t, 'swarm-cli-');
        const specsDir = path.join(tempDir, 'specs');
        const outputDir = path.join(tempDir, 'output');
        mkdirSync(specsDir, { recursive: true });
        writeSpecsDir(specsDir);

        const { swarm } = await importSwarm();
        await swarm({
            specsDir,
            output: outputDir,
            reportFormat: 'json',
            enableHealthMonitoring: true,
            enablePerformanceProfiling: false,
            enableAutoOptimization: false,
            aiRecommendations: false,
        });

        const coordinatorPath = path.join(outputDir, 'coordinator.ts');
        const usersAvatarPath = path.join(outputDir, 'users', 'avatar.ts');
        const ordersAvatarPath = path.join(outputDir, 'orders', 'avatar.ts');
        const usersClientPath = path.join(outputDir, 'users', 'index.ts');
        const ordersClientPath = path.join(outputDir, 'orders', 'index.ts');

        assert.ok(existsSync(coordinatorPath), 'coordinator.ts should exist');
        assert.ok(existsSync(usersAvatarPath), 'users/avatar.ts should exist');
        assert.ok(existsSync(ordersAvatarPath), 'orders/avatar.ts should exist');
        assert.ok(existsSync(usersClientPath), 'users/index.ts should exist');
        assert.ok(existsSync(ordersClientPath), 'orders/index.ts should exist');

        const coordinatorSource = readFileSync(coordinatorPath, 'utf8');
        assert.ok(!coordinatorSource.includes('Math.random'), 'coordinator.ts should not use Math.random');
    });

    test('generates api-server.ts when --generate-api-server is enabled', async t => {
        const tempDir = createTempDir(t, 'swarm-cli-api-server-');
        const specsDir = path.join(tempDir, 'specs');
        const outputDir = path.join(tempDir, 'output');
        mkdirSync(specsDir, { recursive: true });
        writeSpecsDir(specsDir);

        const { swarm } = await importSwarm();
        await swarm({
            specsDir,
            output: outputDir,
            reportFormat: 'json',
            generateApiServer: true,
            apiServerPort: '3200',
            enableHealthMonitoring: true,
            enablePerformanceProfiling: false,
            enableAutoOptimization: false,
            aiRecommendations: false,
        });

        const apiServerPath = path.join(outputDir, 'api-server.ts');
        assert.ok(existsSync(apiServerPath), 'api-server.ts should exist');

        const apiServerSource = readFileSync(apiServerPath, 'utf8');
        assert.ok(apiServerSource.includes('createApiServer'), 'api-server.ts should export createApiServer');
        assert.ok(apiServerSource.includes('3200'), 'api-server.ts should use configured port');
        assert.ok(apiServerSource.includes('/consensus/propose'), 'api-server.ts should expose consensus endpoint');
    });
});
