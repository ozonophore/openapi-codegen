import { pathToArray } from './pathToArray';

/**
 * Obtain object by ref
 * @param ref path
 * @param object
 */
export function getDefinition(ref: string, object: any): any {
    const path = pathToArray(ref);
    let definition: any = object;
    for (const field of path) {
        if (definition.hasOwnProperty(field)) {
            definition = definition[field];
        } else {
            return null;
        }
    }
    return definition;
}
