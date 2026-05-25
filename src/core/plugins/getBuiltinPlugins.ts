import { OpenApiGeneratorPlugin } from './GeneratorPlugin.model';
import { xTypescriptTypePlugin } from './builtins/xTypescriptTypePlugin';

/**
 * Returns built-in plugins bundled with the generator.
 */
export function getBuiltinPlugins(): OpenApiGeneratorPlugin[] {
    return [xTypescriptTypePlugin];
}
