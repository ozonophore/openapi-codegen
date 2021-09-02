import { InvalidPointerError } from 'json-schema-ref-parser';

const escapedSlash = /~1/g;
const escapedTilde = /~0/g;

/**
 * Returns the hash (URL fragment), of the given path.
 * If there is no hash, then the root hash ("#") is returned.
 *
 * @param   {string} path
 * @returns {string}
 */
function getHash(path: string): string {
    const hashIndex = path.indexOf('#');
    if (hashIndex >= 0) {
        return path.substr(hashIndex);
    }
    return '#';
}

export function parsPath(path: string) {
    // Get the JSON pointer from the path's hash
    const pointer = getHash(path).substr(1);

    // If there's no pointer, then there are no tokens,
    // so return an empty array
    if (!pointer) {
        return [];
    }

    // Split into an array
    const pointers = pointer.split('/');

    // Decode each part, according to RFC 6901
    for (let i = 0; i < pointers.length; i++) {
        pointers[i] = decodeURIComponent(pointers[i].replace(escapedSlash, '/').replace(escapedTilde, '~'));
    }

    if (pointers[0] !== '') {
        throw new InvalidPointerError(pointer, path);
    }

    return pointers.slice(1);
};
