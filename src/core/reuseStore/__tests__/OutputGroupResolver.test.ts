import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { resolveOutputGroups } from '../OutputGroupResolver';

describe('@unit: OutputGroupResolver', () => {
    test('returns null for single path', () => {
        assert.equal(resolveOutputGroups(['/project/out/api-a']), null);
    });

    test('returns null for empty array', () => {
        assert.equal(resolveOutputGroups([]), null);
    });

    test('finds LCA for two sibling output paths', () => {
        const result = resolveOutputGroups(['/project/out/api-a', '/project/out/api-b']);
        assert.equal(result, '/project/out');
    });

    test('finds LCA for three paths with common prefix', () => {
        const result = resolveOutputGroups(['/project/out/a', '/project/out/b', '/project/out/c']);
        assert.equal(result, '/project/out');
    });

    test('returns null when LCA is root "/"', () => {
        const result = resolveOutputGroups(['/api-a', '/api-b']);
        assert.equal(result, null);
    });

    test('returns null when LCA equals one of the input paths', () => {
        // LCA would be /project/out which equals the first input
        const result = resolveOutputGroups(['/project/out', '/project/out/api-a']);
        assert.equal(result, null);
    });

    test('returns null for paths with no common ancestor beyond root', () => {
        const result = resolveOutputGroups(['/foo/bar', '/baz/qux']);
        assert.equal(result, null);
    });

    test('returns null when only one segment is common and equals root-level segment', () => {
        // Both paths share only a root-level drive/dir with no meaningful common parent
        const result = resolveOutputGroups(['/Foo/bar', '/foo/bar']);
        assert.equal(result, null);
    });
});
