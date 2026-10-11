import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, mock, test } from 'node:test';

import { APP_LOGGER } from '../../../common/Consts';
import { LOGGER_MESSAGES } from '../../../common/LoggerMessages';
import { relativeHelper, resolveHelper } from '../../../common/utils/pathHelpers';
import { analyzeDiffOptionsSchema } from '../../schemas/analyzeDiff';
import { generateOptionsSchema } from '../../schemas/generate';
import { resolvePluginEntries } from '../pluginPaths';

describe('@unit: analyze-diff / generate plugin CLI schemas', () => {
    test('generateOptionsSchema accepts plugins array', () => {
        const parsed = generateOptionsSchema.safeParse({
            openapiConfig: './openapi.config.json',
            plugins: ['./a.cjs', './b.cjs'],
            strictPluginMode: true,
        });
        assert.equal(parsed.success, true);
        if (parsed.success) {
            assert.deepEqual(parsed.data.plugins, ['./a.cjs', './b.cjs']);
            assert.equal(parsed.data.strictPluginMode, true);
        }
    });

    test('analyzeDiffOptionsSchema accepts plugins array and strictPluginMode', () => {
        const parsed = analyzeDiffOptionsSchema.safeParse({
            input: './spec.yaml',
            compareWith: './old.yaml',
            plugins: ['./hooks.cjs'],
            strictPluginMode: true,
        });
        assert.equal(parsed.success, true);
        if (parsed.success) {
            assert.deepEqual(parsed.data.plugins, ['./hooks.cjs']);
            assert.equal(parsed.data.strictPluginMode, true);
        }
    });

    test('resolvePluginEntries merges config and CLI', () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-paths-'));
        const configPath = join(tempDir, 'openapi.config.json');
        writeFileSync(configPath, JSON.stringify({ plugins: ['./from-config.cjs'] }));

        try {
            const entries = resolvePluginEntries(configPath, ['./from-cli.cjs', './from-config.cjs']);
            assert.deepEqual(
                entries.map(e => e.path),
                ['./from-config.cjs', './from-cli.cjs']
            );
            assert.deepEqual(entries[0]?.config, {});
            assert.deepEqual(entries[1]?.config, {});
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('resolvePluginEntries preserves object config', () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-entries-config-'));
        const configPath = join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                plugins: [{ path: './hooks.cjs', name: 'hooks', config: { mode: 'strict' } }],
            })
        );

        try {
            const entries = resolvePluginEntries(configPath, ['./from-cli.cjs']);
            assert.equal(entries.length, 2);
            assert.equal(entries[0]?.path, './hooks.cjs');
            assert.equal(entries[0]?.name, 'hooks');
            assert.deepEqual(entries[0]?.config, { mode: 'strict' });
            assert.equal(entries[1]?.path, './from-cli.cjs');
            assert.deepEqual(entries[1]?.config, {});
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('resolvePluginEntries loads Active item plugins only', () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-paths-active-'));
        const configPath = join(tempDir, 'openapi.config.json');
        const specAAbs = join(tempDir, 'a.yaml');
        const specBAbs = join(tempDir, 'b.yaml');
        writeFileSync(
            configPath,
            JSON.stringify({
                plugins: ['./root.cjs'],
                items: [
                    { input: specAAbs, output: './out-a', plugins: ['./item-a.cjs'] },
                    { input: specBAbs, output: './out-b', plugins: ['./item-b.cjs'] },
                ],
            })
        );

        try {
            const entries = resolvePluginEntries(configPath, ['./from-cli.cjs'], specAAbs);
            assert.deepEqual(
                entries.map(e => e.path),
                ['./root.cjs', './item-a.cjs', './from-cli.cjs']
            );
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('resolvePluginEntries matches relative item.input to absolute activeInput', () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-paths-rel-'));
        const configPath = join(tempDir, 'openapi.config.json');
        const specAbs = join(tempDir, 'a.yaml');
        const specRel = relativeHelper(process.cwd(), specAbs);
        writeFileSync(
            configPath,
            JSON.stringify({
                items: [
                    { input: specRel, output: './out-a', plugins: ['./item-a.cjs'] },
                    { input: join(tempDir, 'b.yaml'), output: './out-b', plugins: ['./item-b.cjs'] },
                ],
            })
        );

        try {
            const entries = resolvePluginEntries(configPath, ['./from-cli.cjs'], resolveHelper(specAbs));
            assert.deepEqual(
                entries.map(e => e.path),
                ['./item-a.cjs', './from-cli.cjs']
            );
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('resolvePluginEntries uses root plus CLI when no item matches', () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-paths-miss-'));
        const configPath = join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                plugins: ['./root.cjs'],
                items: [
                    { input: join(tempDir, 'a.yaml'), output: './out-a', plugins: ['./item-a.cjs'] },
                    { input: join(tempDir, 'b.yaml'), output: './out-b', plugins: ['./item-b.cjs'] },
                ],
            })
        );

        try {
            const entries = resolvePluginEntries(configPath, ['./from-cli.cjs'], join(tempDir, 'missing.yaml'));
            assert.deepEqual(
                entries.map(e => e.path),
                ['./root.cjs', './from-cli.cjs']
            );
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('resolvePluginEntries omits item plugins when activeInput is omitted', () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-paths-omit-'));
        const configPath = join(tempDir, 'openapi.config.json');
        writeFileSync(
            configPath,
            JSON.stringify({
                plugins: ['./root.cjs'],
                items: [{ input: join(tempDir, 'a.yaml'), output: './out-a', plugins: ['./item-a.cjs'] }],
            })
        );

        try {
            const entries = resolvePluginEntries(configPath, ['./from-cli.cjs']);
            assert.deepEqual(
                entries.map(e => e.path),
                ['./root.cjs', './from-cli.cjs']
            );
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('resolvePluginEntries merges plugins and warns when two items share input', () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'openapi-plugin-paths-dup-'));
        const configPath = join(tempDir, 'openapi.config.json');
        const sharedInput = join(tempDir, 'shared.yaml');
        writeFileSync(
            configPath,
            JSON.stringify({
                items: [
                    { input: sharedInput, output: './out-a', plugins: ['./item-a.cjs'] },
                    { input: sharedInput, output: './out-b', plugins: ['./item-b.cjs'] },
                ],
            })
        );

        const warnMock = mock.method(APP_LOGGER, 'warn', () => undefined);
        try {
            const entries = resolvePluginEntries(configPath, ['./from-cli.cjs'], sharedInput);
            assert.deepEqual(
                entries.map(e => e.path),
                ['./item-a.cjs', './item-b.cjs', './from-cli.cjs']
            );
            assert.equal(warnMock.mock.callCount(), 1);
            assert.equal(warnMock.mock.calls[0]?.arguments[0], LOGGER_MESSAGES.ANALYZE_DIFF.DUPLICATE_ACTIVE_ITEM(resolveHelper(sharedInput), 2));
        } finally {
            warnMock.mock.restore();
            rmSync(tempDir, { recursive: true, force: true });
        }
    });
});
