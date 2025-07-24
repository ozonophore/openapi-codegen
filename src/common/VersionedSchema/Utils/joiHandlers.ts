import { TraverseHandler } from "../Types";

/** Handler for Joi.Schema: only the launch remains .describe() */
export const joiSchemaHandler: TraverseHandler = (value, recurse) => {
  if (value && typeof value.describe === 'function') {
    recurse(value.describe());
    return true;  // then the default bypass to the scheme itself is not needed.
  }
  return false;
};

/** Handler for the result of describe(): pulls out only the real keys of the field */
export const joiDescHandler: TraverseHandler = (value, recurse, result) => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  let did = false;

  // only if there are keys/items/matches/patterns, we assume that this description
  if (value.keys && typeof value.keys === 'object') {
    did = true;
    for (const key of Object.keys(value.keys)) {
      result.add(key);
      recurse(value.keys[key]);
    }
  }

  if (Array.isArray(value.items)) {
    did = true;
    for (const item of value.items) recurse(item);
  }

  if (Array.isArray(value.matches)) {
    did = true;
    for (const m of value.matches) {
      if (m.schema) recurse(m.schema);
      if (m.then) recurse(m.then);
      if (m.otherwise) recurse(m.otherwise);
    }
  }

  if (Array.isArray(value.patterns)) {
    did = true;
    for (const p of value.patterns) {
      if (p.rule) recurse(p.rule);
    }
  }

  return did;  // if this is the description, the default bypass is not needed.
};