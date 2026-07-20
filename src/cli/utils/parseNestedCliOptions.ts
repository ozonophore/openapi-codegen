const MARAUDER_GROUP_KEYS: Record<string, string> = {
    'auto-select': 'autoSelect',
    'spec-analysis': 'specAnalysis',
    'anomaly-detection': 'anomalyDetection',
    'workspace-report': 'workspaceReport',
    'traffic-splitter': 'trafficSplitter',
    swarm: 'swarm',
};

export type NestedMarauderOptions = {
    autoSelect?: Record<string, unknown>;
    specAnalysis?: Record<string, unknown>;
    anomalyDetection?: Record<string, unknown>;
    workspaceReport?: Record<string, unknown>;
    trafficSplitter?: Record<string, unknown>;
    swarm?: Record<string, unknown>;
};

function kebabToCamel(value: string): string {
    return value.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
}

function parseScalarValue(raw: string): unknown {
    if (raw === 'true') {
        return true;
    }
    if (raw === 'false') {
        return false;
    }
    if (/^-?\d+$/.test(raw)) {
        return Number(raw);
    }
    return raw;
}

function parseJsonObject(raw: string, flagName: string): Record<string, unknown> {
    try {
        const parsed = JSON.parse(raw);
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error(`Expected JSON object for --${flagName}`);
        }
        return parsed as Record<string, unknown>;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Invalid JSON for --${flagName}: ${message}`);
    }
}

function parseGroupValue(raw: string, flagName: string): Record<string, unknown> | boolean {
    if (raw.startsWith('{')) {
        return parseJsonObject(raw, flagName);
    }

    if (raw === 'true' || raw === 'false') {
        return raw === 'true';
    }

    return { enabled: parseScalarValue(raw) === true };
}

function mergeGroupValue(current: Record<string, unknown> | undefined, incoming: Record<string, unknown> | boolean): Record<string, unknown> {
    if (typeof incoming === 'boolean') {
        return { ...(current ?? {}), enabled: incoming };
    }

    const merged = { ...(current ?? {}), ...incoming };
    if (merged.enabled === undefined) {
        merged.enabled = true;
    }

    return merged;
}

function setNestedField(nestedOptions: NestedMarauderOptions, groupKey: keyof NestedMarauderOptions, fieldKey: string, value: unknown): void {
    const group = nestedOptions[groupKey] ?? {};
    group[fieldKey] = value;
    nestedOptions[groupKey] = group;
}

/**
 * Pre-parses Marauder dot-notation and JSON flags before Commander consumes argv.
 * Consumed args are removed from the returned argv copy.
 */
export function parseNestedCliOptions(argv: readonly string[]): {
    cleanedArgv: string[];
    nestedOptions: NestedMarauderOptions;
} {
    const cleanedArgv = argv.slice(0, 2);
    const nestedOptions: NestedMarauderOptions = {};

    for (let index = 2; index < argv.length; index += 1) {
        const arg = argv[index];

        if (!arg.startsWith('--')) {
            cleanedArgv.push(arg);
            continue;
        }

        const equalsIndex = arg.indexOf('=');
        const flagBody = equalsIndex >= 0 ? arg.slice(2, equalsIndex) : arg.slice(2);
        const inlineValue = equalsIndex >= 0 ? arg.slice(equalsIndex + 1) : undefined;
        const dotIndex = flagBody.indexOf('.');

        if (dotIndex >= 0) {
            const groupKebab = flagBody.slice(0, dotIndex);
            const fieldKebab = flagBody.slice(dotIndex + 1);
            const groupKey = (MARAUDER_GROUP_KEYS[groupKebab] ?? kebabToCamel(groupKebab)) as keyof NestedMarauderOptions;
            const fieldKey = kebabToCamel(fieldKebab);

            let value: unknown;
            if (inlineValue !== undefined) {
                value = parseScalarValue(inlineValue);
            } else if (index + 1 < argv.length && !argv[index + 1].startsWith('-')) {
                index += 1;
                value = parseScalarValue(argv[index]);
            } else {
                value = true;
            }

            setNestedField(nestedOptions, groupKey, fieldKey, value);
            continue;
        }

        const groupKey = MARAUDER_GROUP_KEYS[flagBody] as keyof NestedMarauderOptions | undefined;
        if (groupKey) {
            if (inlineValue !== undefined) {
                nestedOptions[groupKey] = mergeGroupValue(nestedOptions[groupKey], parseGroupValue(inlineValue, flagBody));
                continue;
            }

            if (index + 1 < argv.length && !argv[index + 1].startsWith('-')) {
                const nextArg = argv[index + 1];
                if (nextArg.startsWith('{')) {
                    index += 1;
                    nestedOptions[groupKey] = mergeGroupValue(nestedOptions[groupKey], parseJsonObject(nextArg, flagBody));
                    continue;
                }
            }
        }

        cleanedArgv.push(arg);
    }

    return { cleanedArgv, nestedOptions };
}

/**
 * Merges pre-parsed nested Marauder flags into Commander-parsed generate options.
 */
export function mergeNestedCliOptions<T extends Record<string, unknown>>(cliOptions: T, nestedOptions: NestedMarauderOptions): T {
    const merged: Record<string, unknown> = { ...cliOptions };

    for (const groupKey of ['autoSelect', 'specAnalysis', 'anomalyDetection', 'workspaceReport', 'trafficSplitter', 'swarm'] as const) {
        const nestedGroup = nestedOptions[groupKey];
        if (!nestedGroup) {
            continue;
        }

        const existing = merged[groupKey];
        if (typeof existing === 'boolean') {
            merged[groupKey] = { enabled: existing, ...nestedGroup };
            continue;
        }

        if (existing && typeof existing === 'object') {
            merged[groupKey] = { ...existing, ...nestedGroup };
            continue;
        }

        merged[groupKey] = nestedGroup;
    }

    return merged as T;
}
