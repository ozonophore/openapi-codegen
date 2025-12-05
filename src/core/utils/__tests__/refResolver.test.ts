import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { normalizeAllRefs } from '../normalizeAllRefs';
import { normalizeRef } from '../normalizeRef';
import { parseRef, RefType } from '../parseRef';
import { resolveRefPath } from '../resolveRefPath';

describe('ref resolver utils (native node:test)', () => {
  it('parseRef: http url', () => {
    const parsed = parseRef('https://example.com/schema.json');
    assert.equal(parsed.type, RefType.HTTP_URL);
    assert.equal(parsed.originalRef, 'https://example.com/schema.json');
  });

  it('parseRef: local fragment', () => {
    const parsed = parseRef('#/components/schemas/Model');
    assert.equal(parsed.type, RefType.LOCAL_FRAGMENT);
    assert.equal(parsed.fragment, '#/components/schemas/Model');
  });

  it('parseRef: external file with fragment', () => {
    const parsed = parseRef('./models/User.yaml#/components/schemas/User');
    assert.equal(parsed.type, RefType.EXTERNAL_FILE_FRAGMENT);
    assert.equal(parsed.filePath, './models/User.yaml');
    assert.equal(parsed.fragment, '#/components/schemas/User');
  });

  it('resolveRefPath: resolves relative to parent file', () => {
    const parent = '/project/specs/api.yaml';
    const parsed = parseRef('./models/User.yaml#/components/schemas/User');
    const resolved = resolveRefPath(parsed, parent);
    // POSIX path check: should end with /project/specs/models/User.yaml
    assert.ok(resolved.endsWith('/project/specs/models/User.yaml') || resolved.endsWith('/project/specs/models/User.yaml'), `resolved=${resolved}`);
  });

  it('normalizeRef: external file + fragment => normalized absolute path with fragment', () => {
    const parent = '/project/specs/api.yaml';
    const normalized = normalizeRef('./models/User.yaml#/components/schemas/User', parent);
    assert.ok(normalized.endsWith('/project/specs/models/User.yaml#/components/schemas/User'), `normalized=${normalized}`);
  });

  it('normalizeAllRefs: deep traversal normalizes $ref', () => {
    const obj = {
      components: {
        schemas: {
          User: {
            $ref: './schemas/user.yaml#/User'
          }
        }
      }
    };
    const normalized = normalizeAllRefs(obj as any, {} as any, '/project/specs/api.yaml');
    const ref = (normalized as any).components.schemas.User.$ref;
    assert.ok(ref.endsWith('/project/specs/schemas/user.yaml#/User'), `ref=${ref}`);
  });
});