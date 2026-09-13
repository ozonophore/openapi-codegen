/**
 * Example Plugin factory API (`apiVersion: '3'` on meta only).
 *
 * Usage in openapi.config.json:
 *   "plugins": ["./plugins/factory-type.plugin.cjs"]
 *
 * Or with config (calls onConfigure):
 *   { "path": "./plugins/factory-type.plugin.cjs", "config": { "mode": "strict" } }
 *
 * A flat `{ name, apiVersion: '3', … }` object will not load.
 */
module.exports = {
    meta: { name: 'factory-type', apiVersion: '3' },
    createPlugin(api) {
        let mode;

        api.onConfigure(config => {
            mode = config.mode;
        });

        api.onSchemaTypeOverride(({ schema }, runtime) => {
            if (runtime.executionMode !== 'generate') {
                return undefined;
            }
            if (!schema || typeof schema !== 'object') {
                return undefined;
            }
            const custom = schema['x-custom-type'];
            if (typeof custom === 'string' && custom.trim()) {
                return mode === 'strict' ? custom.trim() : custom;
            }
            return undefined;
        });
    },
};
