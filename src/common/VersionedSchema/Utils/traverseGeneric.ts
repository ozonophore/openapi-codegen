import { TraverseHandler } from "../Types";

export function traverseGeneric(
  root: any,
  handlers: TraverseHandler[],
  result: Set<string>
) {
  const recurse = (v: any) => traverseGeneric(v, handlers, result);

  // We try "special" handlers
  let handled = false;
  for (const handler of handlers) {
    if (handler(root, recurse, result)) {
      handled = true;
    }
  }

  // If none of the handlers worked, a basic bypass
  if (handled) return;

  if (root && typeof root === 'object') {
    if (Array.isArray(root)) {
      for (const item of root) {
        recurse(item);
      }
    } else {
      for (const key of Object.keys(root)) {
        result.add(key);
        recurse(root[key]);
      }
    }
  }
}