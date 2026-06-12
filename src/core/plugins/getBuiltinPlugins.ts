import { xTypescriptTypePlugin } from './builtins/xTypescriptTypePlugin';
import { OpenApiGeneratorPlugin } from './GeneratorPlugin.model';

/**
 * Returns built-in plugins bundled with the generator.
 * Built-ins are appended after user plugins and provide fallback behavior.
 */
export function getBuiltinPlugins(): OpenApiGeneratorPlugin[] {
    return [xTypescriptTypePlugin];
}
