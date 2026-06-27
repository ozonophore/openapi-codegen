import assert from 'node:assert';
import { describe, test } from 'node:test';

import { formatRenameMiraclesForGuide } from '../formatRenameMiraclesForGuide';

describe('@unit: formatRenameMiraclesForGuide', () => {
    test('returns empty string when no rename miracles', () => {
        assert.strictEqual(formatRenameMiraclesForGuide([]), '');
    });

    test('formats rename miracles with paths and analyze-usage hint', () => {
        const section = formatRenameMiraclesForGuide([
            {
                oldPath: '#/components/schemas/User',
                newPath: '#/components/schemas/UserProfile',
                type: 'RENAME',
                confidence: 0.92,
                status: 'confirmed',
                modelName: 'User',
                oldProperty: 'first_name',
                newProperty: 'firstName',
            },
        ]);

        assert.match(section, /Symbol Renames \(from analyze-diff\)/);
        assert.match(section, /User\.first_name → User\.firstName/);
        assert.match(section, /confidence: 92%/);
        assert.match(section, /--diff-report/);
    });
});
