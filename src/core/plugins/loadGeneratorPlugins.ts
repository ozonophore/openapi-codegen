import { resolveHelper } from '../../common/utils/pathHelpers';
import { OpenApiGeneratorPlugin } from './GeneratorPlugin.model';
import { getBuiltinPlugins } from './getBuiltinPlugins';
import { pathToFileURL } from 'node:url';

/**
 * Type guard for runtime plugin objects.
 */
function isOpenApiGeneratorPlugin(value: unknown): value is OpenApiGeneratorPlugin {
    return !!value && typeof value === 'object' && typeof (value as OpenApiGeneratorPlugin).name === 'string';
}

/**
 * Resolves plugin export from a required module.
 */
function getPluginFromModule(moduleExports: unknown): unknown {
    const exported = moduleExports as Record<string, unknown>;
    return exported?.default ?? exported?.plugin ?? moduleExports;
}

/**
 * Checks whether loader can fallback from require() to dynamic import().
 */
function canFallbackToDynamicImport(error: unknown): boolean {
    const errorCode = typeof error === 'object' && error && 'code' in error ? String((error as Record<string, unknown>).code) : '';
    const errorMessage = error instanceof Error ? error.message : '';

    return (
        errorCode === 'ERR_REQUIRE_ESM' ||
        errorCode === 'ERR_UNKNOWN_FILE_EXTENSION' ||
        errorMessage.includes('Cannot use import statement outside a module') ||
        errorMessage.includes('Unexpected token export')
    );
}

/**
 * Loads a plugin module from a file path using require() with import() fallback.
 */
async function loadPluginModule(pluginPath: string): Promise<unknown> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require(pluginPath);
    } catch (error) {
        if (!canFallbackToDynamicImport(error)) {
            throw error;
        }
        return import(pathToFileURL(pluginPath).href);
    }
}

/**
 * Loads user plugins and appends built-in plugins as fallback handlers.
 */
export async function loadGeneratorPlugins(pluginPaths: string[]): Promise<OpenApiGeneratorPlugin[]> {
    const loadedPlugins: OpenApiGeneratorPlugin[] = [];

    for (const pluginPath of pluginPaths) {
        const resolvedPath = resolveHelper(process.cwd(), pluginPath);
        const moduleExports = await loadPluginModule(resolvedPath);
        const plugin = getPluginFromModule(moduleExports);
        if (!isOpenApiGeneratorPlugin(plugin)) {
            throw new Error(`Invalid plugin at "${pluginPath}": expected export with shape { name: string }`);
        }
        loadedPlugins.push(plugin);
    }

    return [...loadedPlugins, ...getBuiltinPlugins()];
}
