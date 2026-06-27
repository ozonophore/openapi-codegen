import assert from 'node:assert';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test, type TestContext } from 'node:test';

import { ProjectContext } from '../../../core/projectProbe';
import type { MiracleEntry } from '../../../core/types/shared/Miracle.model';
import type { Contract } from '../types';
import { createApiImportScope } from '../utils/apiImportScope';
import { checkRenameMiracles } from '../utils/checkRenameMiracles';

function createTempDir(t: TestContext, prefix: string): string {
    const generatedRoot = path.join(__dirname, 'generated');
    mkdirSync(generatedRoot, { recursive: true });
    const tempDir = mkdtempSync(path.join(generatedRoot, prefix));
    t.after(() => {
        rmSync(tempDir, { recursive: true, force: true });
    });
    return tempDir;
}

function createContract(entryFile: ReturnType<ProjectContext['project']['addSourceFileAtPath']>): Contract {
    return {
        services: {},
        clientServiceKeys: {},
        schemas: ['UserSchema'],
        models: ['User'],
        sourceFile: entryFile,
    };
}

describe('@unit: checkRenameMiracles', () => {
    test('warns when consumer import still uses old schema name after rename miracle', t => {
        const tempDir = createTempDir(t, 'rename-miracle-');
        const apiDir = path.join(tempDir, 'generated');
        const srcDir = path.join(tempDir, 'src');
        mkdirSync(apiDir, { recursive: true });
        mkdirSync(srcDir, { recursive: true });

        const entryPath = path.join(apiDir, 'index.ts');
        const consumerPath = path.join(srcDir, 'app.ts');

        writeFileSync(entryPath, 'export const UserSchema = {};\nexport type User = {};\n');
        writeFileSync(consumerPath, `import { OldUserSchema } from '../generated/index';\n`);

        const context = new ProjectContext(tempDir);
        const entryFile = context.project.addSourceFileAtPath(entryPath);
        context.project.addSourceFileAtPath(consumerPath);
        const contract = createContract(entryFile);
        const apiScope = createApiImportScope(entryPath);

        const miracles: MiracleEntry[] = [
            {
                oldPath: '$.components.schemas.OldUser',
                newPath: '$.components.schemas.User',
                type: 'RENAME',
                confidence: 1,
                status: 'auto-generated',
            },
        ];

        const findings = checkRenameMiracles(context, contract, apiScope, miracles);

        assert.strictEqual(findings.length, 1);
        assert.strictEqual(findings[0].id, 'DIFF_RENAME_NOT_APPLIED');
        assert.strictEqual(findings[0].severity, 'WARNING');
        assert.strictEqual(findings[0].category, 'RENAMED_SYMBOL');
        assert.strictEqual(findings[0].context?.newSymbol, 'UserSchema');
    });

    test('does not warn when consumer already imports the renamed symbol', t => {
        const tempDir = createTempDir(t, 'rename-miracle-updated-');
        const apiDir = path.join(tempDir, 'generated');
        const srcDir = path.join(tempDir, 'src');
        mkdirSync(apiDir, { recursive: true });
        mkdirSync(srcDir, { recursive: true });

        const entryPath = path.join(apiDir, 'index.ts');
        const consumerPath = path.join(srcDir, 'app.ts');

        writeFileSync(entryPath, 'export const UserSchema = {};\nexport type User = {};\n');
        writeFileSync(consumerPath, `import { UserSchema } from '../generated/index';\n`);

        const context = new ProjectContext(tempDir);
        const entryFile = context.project.addSourceFileAtPath(entryPath);
        context.project.addSourceFileAtPath(consumerPath);
        const contract = createContract(entryFile);
        const apiScope = createApiImportScope(entryPath);

        const miracles: MiracleEntry[] = [
            {
                oldPath: '$.components.schemas.OldUser',
                newPath: '$.components.schemas.User',
                type: 'RENAME',
                confidence: 1,
                status: 'auto-generated',
            },
        ];

        const findings = checkRenameMiracles(context, contract, apiScope, miracles);

        assert.strictEqual(findings.length, 0);
    });

    test('ignores TYPE_COERCION miracles', () => {
        const miracles: MiracleEntry[] = [
            {
                oldPath: '$.components.schemas.User.properties.age',
                newPath: '$.components.schemas.User.properties.age',
                type: 'TYPE_COERCION',
                confidence: 1,
                status: 'auto-generated',
            },
        ];

        const findings = checkRenameMiracles(
            { getConsumerSourceFiles: () => [] } as unknown as ProjectContext,
            {
                services: {},
                clientServiceKeys: {},
                schemas: [],
                models: [],
                sourceFile: { getExportedDeclarations: () => new Map() },
            } as unknown as Contract,
            createApiImportScope('/tmp/generated/index.ts'),
            miracles
        );

        assert.strictEqual(findings.length, 0);
    });
});
