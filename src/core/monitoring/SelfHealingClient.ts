import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { stringify as stringifyYamlDocument } from 'yaml';

import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { ChangeDetector } from '../migration/ChangeDetector';
import { ChangeDetectionResult, HealingEvent, SelfHealingConfig } from '../migration/types';

export class SelfHealingClient {
    private readonly DEFAULT_CONFIG: SelfHealingConfig = {
        enabled: true,
        monitorInterval: 3600000, // 1 hour
        autoApplyNonBreaking: true,
        notifyOnBreaking: true,
        createBackupBeforeApply: true,
        rollbackOnFailure: true,
        logFilePath: './self-healing.log',
    };

    private healingEvents: HealingEvent[] = [];
    private monitoringActive = false;
    private monitoringIntervalHandle: ReturnType<typeof setInterval> | null = null;
    private activeSpecUrl = '';
    private activeLocalSpecPath = '';
    private activeConfig: SelfHealingConfig = this.DEFAULT_CONFIG;
    private changeDetector: ChangeDetector;

    constructor() {
        this.changeDetector = new ChangeDetector();
    }

    /**
     * Start monitoring for specification changes
     * @param specUrl URL удалённой OpenAPI-спецификации
     * @param localSpecPath путь к локальной копии спецификации
     * @param [config] настройки self-healing
     */
    public async startMonitoring(specUrl: string, localSpecPath: string, config?: Partial<SelfHealingConfig>): Promise<void> {
        const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };

        if (!mergedConfig.enabled) {
            return;
        }

        this.monitoringActive = true;
        this.activeSpecUrl = specUrl;
        this.activeLocalSpecPath = localSpecPath;
        this.activeConfig = mergedConfig;

        this.setupMonitoringInterval(specUrl, localSpecPath, mergedConfig);

        this.logEvent({
            timestamp: new Date().toISOString(),
            type: 'spec-change-detected',
            status: 'pending',
            details: 'Self-healing monitoring started',
        });
    }

    /**
     * Stop monitoring and clear the interval handle.
     */
    public stopMonitoring(): void {
        this.monitoringActive = false;

        if (this.monitoringIntervalHandle !== null) {
            clearInterval(this.monitoringIntervalHandle);
            this.monitoringIntervalHandle = null;
        }

        this.logEvent({
            timestamp: new Date().toISOString(),
            type: 'spec-change-detected',
            status: 'success',
            details: 'Self-healing monitoring stopped',
        });
    }

    /**
     * Выполняет один цикл: загрузка remote/local спеки и checkAndApplyChanges.
     * @param specUrl URL удалённой спецификации
     * @param localSpecPath путь к локальной спецификации
     * @param [config] настройки self-healing
     * @returns журнал событий healing за цикл
     */
    public async runOnce(specUrl: string, localSpecPath: string, config?: Partial<SelfHealingConfig>): Promise<HealingEvent[]> {
        const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };
        this.activeConfig = mergedConfig;

        const remoteSpec = await this.loadRemoteSpec(specUrl);
        const localSpec = await this.loadLocalSpec(localSpecPath);
        return this.checkAndApplyChanges(localSpec, remoteSpec, config, localSpecPath);
    }

    /**
     * Check for changes and apply if applicable
     * @param oldSpec предыдущая локальная спецификация
     * @param newSpec новая спецификация (обычно remote)
     * @param [config] настройки self-healing
     * @returns журнал событий healing
     */
    public async checkAndApplyChanges(oldSpec: any, newSpec: any, config?: Partial<SelfHealingConfig>, localSpecPath?: string): Promise<HealingEvent[]> {
        const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };
        const events: HealingEvent[] = [];
        const specPath = localSpecPath ?? this.activeLocalSpecPath;

        const changeResult = this.changeDetector.detectChanges(oldSpec, newSpec, {
            allowBreaking: mergedConfig.allowBreaking,
            governanceConfig: mergedConfig.governanceConfig,
        });

        if (!changeResult.hasChanges) {
            return events;
        }

        const detectionEvent: HealingEvent = {
            timestamp: new Date().toISOString(),
            type: 'spec-change-detected',
            status: 'pending',
            details: `Detected ${changeResult.changes.length} change(s): ${changeResult.summary}`,
        };
        this.logEvent(detectionEvent);
        events.push(detectionEvent);

        if (changeResult.autoApplicable && mergedConfig.autoApplyNonBreaking) {
            const applyResult = await this.applyChanges(changeResult, newSpec, specPath, mergedConfig);
            events.push(applyResult);
        } else if (changeResult.requiresUserReview || !mergedConfig.autoApplyNonBreaking) {
            const reviewEvent: HealingEvent = {
                timestamp: new Date().toISOString(),
                type: 'user-review-required',
                change: changeResult.changes[0],
                status: 'manual-review',
                details: `Changes require manual review: ${changeResult.summary}`,
            };
            this.logEvent(reviewEvent);
            events.push(reviewEvent);
        }

        return events;
    }

    /**
     * Apply detected changes
     */
    private async applyChanges(changeResult: ChangeDetectionResult, newSpec: any, localSpecPath: string, config: SelfHealingConfig): Promise<HealingEvent> {
        const timestamp = new Date().toISOString();
        let backupPath: string | undefined;

        try {
            const breakingChanges = changeResult.changes.filter(c => c.type === 'breaking');
            const nonBreakingChanges = changeResult.changes.filter(c => c.type !== 'breaking');

            if (breakingChanges.length > 0 && config.notifyOnBreaking) {
                const reviewEvent: HealingEvent = {
                    timestamp,
                    type: 'user-review-required',
                    status: 'manual-review',
                    details: `Breaking changes detected that require manual intervention: ${breakingChanges.map(c => c.description).join(', ')}`,
                    change: breakingChanges[0],
                };
                this.logEvent(reviewEvent);
                return reviewEvent;
            }

            if (config.createBackupBeforeApply && localSpecPath) {
                backupPath = await this.createSpecBackup(localSpecPath);
            }

            const applicableChanges = nonBreakingChanges.length > 0 ? nonBreakingChanges : changeResult.changes.filter(c => c.type === 'addition');

            if (applicableChanges.length > 0 && localSpecPath) {
                await this.regenerateLocalSpec(localSpecPath, newSpec);

                const successEvent: HealingEvent = {
                    timestamp,
                    type: 'auto-applied',
                    status: 'success',
                    specWritten: true,
                    details: `Successfully applied ${applicableChanges.length} change(s): ${applicableChanges.map(c => c.description).join('; ')}`,
                    rollbackInfo: backupPath ? { previousVersion: backupPath, timestamp } : undefined,
                };
                this.logEvent(successEvent);
                return successEvent;
            }

            if (applicableChanges.length > 0 && !localSpecPath) {
                const failedEvent: HealingEvent = {
                    timestamp,
                    type: 'error',
                    status: 'failed',
                    details: 'Changes detected but local spec path is missing; spec was not written',
                };
                this.logEvent(failedEvent);
                return failedEvent;
            }

            return {
                timestamp,
                type: 'auto-applied',
                status: 'success',
                details: 'No applicable changes to apply',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            if (config.rollbackOnFailure && backupPath && localSpecPath) {
                try {
                    await fileSystemHelpers.copyFile(backupPath, localSpecPath);
                } catch {
                    // Best-effort rollback
                }

                const rollbackEvent: HealingEvent = {
                    timestamp,
                    type: 'rollback',
                    status: 'failed',
                    details: `Changes failed to apply and rolled back: ${errorMessage}`,
                    rollbackInfo: {
                        previousVersion: backupPath,
                        timestamp,
                    },
                };
                this.logEvent(rollbackEvent);
                return rollbackEvent;
            }

            const errorEvent: HealingEvent = {
                timestamp,
                type: 'error',
                status: 'failed',
                details: `Failed to apply changes: ${errorMessage}`,
            };
            this.logEvent(errorEvent);
            return errorEvent;
        }
    }

    /**
     * Setup interval-based monitoring
     */
    private setupMonitoringInterval(specUrl: string, localSpecPath: string, config: SelfHealingConfig): void {
        if (!this.monitoringActive || !config.monitorInterval) {
            return;
        }

        const monitoringLogic = async () => {
            if (!this.monitoringActive) {
                return;
            }

            try {
                const remoteSpec = await this.loadRemoteSpec(specUrl);
                const localSpec = await this.loadLocalSpec(localSpecPath);
                await this.checkAndApplyChanges(localSpec, remoteSpec, config, localSpecPath);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                this.logEvent({
                    timestamp: new Date().toISOString(),
                    type: 'error',
                    status: 'failed',
                    details: `Monitoring check failed: ${errorMessage}`,
                });
            }
        };

        void monitoringLogic();

        this.monitoringIntervalHandle = setInterval(() => {
            void monitoringLogic();
        }, config.monitorInterval);
    }

    /**
     * Load remote OpenAPI spec from URL
     */
    private async loadRemoteSpec(specUrl: string): Promise<any> {
        const response = await fetch(specUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch remote spec: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type') || '';
        const text = await response.text();

        if (contentType.includes('yaml') || specUrl.endsWith('.yaml') || specUrl.endsWith('.yml')) {
            return this.parseSpecContent(text, specUrl);
        }

        return JSON.parse(text);
    }

    /**
     * Load local OpenAPI spec from disk
     */
    private async loadLocalSpec(localSpecPath: string): Promise<any> {
        const absolutePath = path.resolve(process.cwd(), localSpecPath);
        const exists = await fileSystemHelpers.exists(absolutePath);
        if (!exists) {
            throw new Error(`Local spec not found: ${absolutePath}`);
        }

        const content = await fileSystemHelpers.readFile(absolutePath, 'utf-8');
        return this.parseSpecContent(content.toString(), absolutePath);
    }

    /**
     * Parse spec content as JSON or YAML
     */
    private async parseSpecContent(content: string, sourcePath: string): Promise<any> {
        const trimmed = content.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            return JSON.parse(trimmed);
        }

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const SwaggerParser = require('@apidevtools/swagger-parser') as typeof import('@apidevtools/swagger-parser');
        const parser = new SwaggerParser();
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'self-healing-'));
        const ext = path.extname(sourcePath) || '.yaml';
        const tmpFile = path.join(tmpDir, `spec${ext}`);

        try {
            fs.writeFileSync(tmpFile, content, 'utf-8');
            return await parser.parse(tmpFile);
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    }

    /**
     * Create a timestamped backup of the local spec file
     */
    private async createSpecBackup(localSpecPath: string): Promise<string> {
        const absolutePath = path.resolve(process.cwd(), localSpecPath);
        const backupDir = path.join(path.dirname(absolutePath), '.self-healing-backups');
        await fileSystemHelpers.mkdir(backupDir);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `${path.basename(absolutePath)}.${timestamp}.backup`);
        await fileSystemHelpers.copyFile(absolutePath, backupPath);
        return backupPath;
    }

    /**
     * Write updated spec to local path (regeneration trigger for downstream codegen)
     */
    private async regenerateLocalSpec(localSpecPath: string, newSpec: any): Promise<void> {
        const absolutePath = path.resolve(process.cwd(), localSpecPath);
        const ext = path.extname(absolutePath).toLowerCase();
        const content = ext === '.yaml' || ext === '.yml' ? this.stringifyYaml(newSpec) : JSON.stringify(newSpec, null, 2);

        await fileSystemHelpers.writeFile(absolutePath, content, 'utf-8');
    }

    /**
     * Minimal YAML serialization for spec updates (JSON-compatible subset)
     */
    private stringifyYaml(spec: any): string {
        return stringifyYamlDocument(spec, { lineWidth: 0 });
    }

    /**
     * Get healing history
     */
    public getHealingHistory(): HealingEvent[] {
        return [...this.healingEvents];
    }

    /**
     * Get healing statistics
     */
    public getHealingStats(): {
        totalEvents: number;
        successful: number;
        failed: number;
        manualReviews: number;
        rollbacks: number;
        autoApplied: number;
        lastEventTime?: string;
    } {
        return {
            totalEvents: this.healingEvents.length,
            successful: this.healingEvents.filter(e => e.status === 'success').length,
            failed: this.healingEvents.filter(e => e.status === 'failed').length,
            manualReviews: this.healingEvents.filter(e => e.status === 'manual-review').length,
            rollbacks: this.healingEvents.filter(e => e.type === 'rollback').length,
            autoApplied: this.healingEvents.filter(e => e.type === 'auto-applied').length,
            lastEventTime: this.healingEvents[this.healingEvents.length - 1]?.timestamp,
        };
    }

    /**
     * Clear healing history
     */
    public clearHistory(): void {
        this.healingEvents = [];
    }

    /**
     * Log a healing event
     */
    private logEvent(event: HealingEvent): void {
        this.healingEvents.push(event);

        const logPath = this.activeConfig.logFilePath || this.DEFAULT_CONFIG.logFilePath;
        if (!logPath) {
            return;
        }

        try {
            const absoluteLogPath = path.resolve(process.cwd(), logPath);
            const logDir = path.dirname(absoluteLogPath);
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            fs.appendFileSync(absoluteLogPath, `${JSON.stringify(event)}\n`, 'utf-8');
        } catch {
            // Logging must not break monitoring
        }
    }

    /**
     * Generate healing report
     */
    public generateReport() {
        const stats = this.getHealingStats();
        const failureRate = stats.totalEvents > 0 ? stats.failed / stats.totalEvents : 0;

        let status: 'healthy' | 'monitoring' | 'needs-review' | 'error' = 'healthy';
        if (this.monitoringActive && stats.totalEvents === 0) {
            status = 'monitoring';
        } else if (stats.manualReviews > 0) {
            status = 'needs-review';
        } else if (failureRate > 0.2) {
            status = 'error';
        }

        const recommendations: string[] = [];
        if (stats.manualReviews > 0) {
            recommendations.push('Review pending changes that require manual intervention');
        }
        if (stats.rollbacks > 0) {
            recommendations.push('Investigate why changes needed to be rolled back');
        }
        if (failureRate > 0.2) {
            recommendations.push('High failure rate detected. Review and adjust auto-apply settings.');
        }
        if (!this.monitoringActive && stats.totalEvents > 0) {
            recommendations.push('Consider re-enabling monitoring for this client');
        }

        return {
            status,
            timestamp: new Date().toISOString(),
            events: this.healingEvents.slice(-10),
            stats,
            recommendations,
        };
    }
}
