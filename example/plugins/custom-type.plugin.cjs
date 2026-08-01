/**
 * Example v1 plugin: map `x-custom-type` (or `x-typescript-type`) to a TypeScript type override.
 *
 * Usage in openapi.config.json:
 *   "plugins": ["./plugins/custom-type.plugin.cjs"]
 *
 * Or CLI:
 *   openapi-codegen-cli generate --plugins ./plugins/custom-type.plugin.cjs ...
 */
module.exports = {
    name: 'custom-type-override',
    apiVersion: '1',
    resolveSchemaTypeOverride: ({ schema }) => {
        if (!schema || typeof schema !== 'object') {
            return undefined;
        }
        const record = /** @type {Record<string, unknown>} */ (schema);
        const custom = record['x-custom-type'];
        if (typeof custom === 'string' && custom.trim()) {
            return custom;
        }
        return undefined;
    },
};
