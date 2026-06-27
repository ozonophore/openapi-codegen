import { OptionValues } from 'commander';

import { APP_LOGGER } from '../../common/Consts';
import { validateZodOptions } from '../../common/Validation/validateZodOptions';
import * as OpenAPI from '../../core';
import { SelfHealingClient } from '../../core/monitoring/SelfHealingClient';
import { HttpClient } from '../../core/types/enums/HttpClient.enum';
import { healSchema, THealOptions } from '../schemas/heal.schema';

function parseMonitorInterval(value: string | number | undefined): number {
    if (value === undefined) {
        return 3600000;
    }
    if (typeof value === 'number') {
        return value;
    }
    const match = value.match(/^(\d+)(ms|s|m|h)?$/i);
    if (!match) {
        return parseInt(value, 10) || 3600000;
    }
    const amount = parseInt(match[1], 10);
    const unit = (match[2] || 'ms').toLowerCase();
    switch (unit) {
        case 's':
            return amount * 1000;
        case 'm':
            return amount * 60 * 1000;
        case 'h':
            return amount * 60 * 60 * 1000;
        default:
            return amount;
    }
}

/**
 * Запускает self-healing: мониторинг удалённой спеки и авто-применение безопасных изменений.
 * @param options опции CLI команды heal
 */
export async function heal(options: OptionValues): Promise<void> {
    const validationResult = validateZodOptions(healSchema, options);
    if (!validationResult.success) {
        APP_LOGGER.error(validationResult.errors.join('\n'));
        process.exit(1);
    }

    const validated = validationResult.data as THealOptions;
    const client = new SelfHealingClient();
    const healingConfig = {
        enabled: true,
        monitorInterval: parseMonitorInterval(validated.monitorInterval),
        autoApplyNonBreaking: validated.autoApplyNonBreaking !== false,
        notifyOnBreaking: validated.notifyOnBreaking !== false,
        createBackupBeforeApply: validated.createBackupBeforeApply !== false,
        logFilePath: validated.logFile || './self-healing.log',
    };

    const regenerateIfNeeded = async (): Promise<void> => {
        if (!validated.output) {
            return;
        }
        APP_LOGGER.info(`Regenerating client into ${validated.output}...`);
        await OpenAPI.generate({
            input: validated.localSpec,
            output: validated.output,
            httpClient: HttpClient.FETCH,
        });
        APP_LOGGER.info('✓ Client regenerated after spec update');
    };

    if (validated.once) {
        APP_LOGGER.info('Running single self-healing check...');
        const events = await client.runOnce(validated.specUrl, validated.localSpec, healingConfig);
        const applied = events.some(event => event.type === 'auto-applied' && event.status === 'success' && event.specWritten === true);
        if (applied) {
            await regenerateIfNeeded();
        }
        APP_LOGGER.info(JSON.stringify(client.generateReport(), null, 2));
        return;
    }

    APP_LOGGER.info('Starting self-healing monitoring (Ctrl+C to stop)...');
    await client.startMonitoring(validated.specUrl, validated.localSpec, healingConfig);

    const shutdown = (): void => {
        client.stopMonitoring();
        APP_LOGGER.info('Self-healing monitoring stopped');
        APP_LOGGER.info(JSON.stringify(client.generateReport(), null, 2));
        process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    await new Promise<void>(() => {
        // keep process alive until signal
    });
}
