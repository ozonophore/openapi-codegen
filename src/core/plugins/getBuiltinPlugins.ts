import { xTypescriptTypePlugin } from './builtins/xTypescriptTypePlugin';
import { OpenApiGeneratorPlugin } from './GeneratorPlugin.model';

/**
 * Returns built-in plugins bundled with the generator.
 */
export function getBuiltinPlugins(): OpenApiGeneratorPlugin[] {
    return [xTypescriptTypePlugin];
}
