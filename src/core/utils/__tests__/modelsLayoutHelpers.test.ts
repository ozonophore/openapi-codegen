import assert from 'node:assert';
import { describe, test } from 'node:test';

import { ModelsLayout } from '../../types/enums/ModelsLayout.enum';
import { ModelsMode } from '../../types/enums/ModelsMode.enum';
import { isClassesBundleLayout, isClassesPerFileLayout } from '../modelsLayoutHelpers';

describe('@unit: modelsLayoutHelpers', () => {
    test('default classes layout is bundle', () => {
        assert.strictEqual(isClassesBundleLayout(ModelsMode.CLASSES), true);
        assert.strictEqual(isClassesBundleLayout(ModelsMode.CLASSES, undefined), true);
        assert.strictEqual(isClassesPerFileLayout(ModelsMode.CLASSES), false);
    });

    test('per-file layout is detected explicitly', () => {
        assert.strictEqual(isClassesPerFileLayout(ModelsMode.CLASSES, ModelsLayout.PER_FILE), true);
        assert.strictEqual(isClassesBundleLayout(ModelsMode.CLASSES, ModelsLayout.PER_FILE), false);
    });

    test('interfaces mode is never classes layout', () => {
        assert.strictEqual(isClassesBundleLayout(ModelsMode.INTERFACES, ModelsLayout.BUNDLE), false);
        assert.strictEqual(isClassesPerFileLayout(ModelsMode.INTERFACES, ModelsLayout.PER_FILE), false);
    });
});
