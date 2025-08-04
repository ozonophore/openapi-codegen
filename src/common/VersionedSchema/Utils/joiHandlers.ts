import { TraverseHandler } from '../Types';

/** Handler for Joi.Schema: only the launch remains .describe() */
export const handleJoiSchema: TraverseHandler<Set<string>> = (value, recurse) => {
    if (value && typeof value.describe === 'function') {
        recurse(value.describe());
        // then the default bypass to the scheme itself is not needed.
        return true;
    }
    return false;
};

/** Handler for the result of describe(): pulls out only the real keys of the field */
export const handleJoiDescription: TraverseHandler<Set<string>> = (value, recurse, result) => {
    if (!value || typeof value !== 'object') {
        return false;
    }

    let processed = false;

    // only if there are keys/items/matches/patterns, we assume that this description
    if (value.keys && typeof value.keys === 'object') {
        processed = true;
        for (const key of Object.keys(value.keys)) {
            result.add(key);
            recurse(value.keys[key]);
        }
    }

    if (Array.isArray(value.items)) {
        processed = true;
        for (const item of value.items) {
            recurse(item);
        }
    }

    if (Array.isArray(value.matches)) {
        processed = true;
        for (const m of value.matches) {
            if (m.schema) {
                recurse(m.schema);
            }
            if (m.then) {
                recurse(m.then);
            }
            if (m.otherwise) {
                recurse(m.otherwise);
            }
        }
    }

    if (Array.isArray(value.patterns)) {
        processed = true;
        for (const p of value.patterns) {
            if (p.rule) {
                recurse(p.rule);
            }
        }
    }
    // if this is the description, the default bypass is not needed.
    return processed;
};
