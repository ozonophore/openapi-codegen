import assert from 'node:assert';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test, type TestContext } from 'node:test';

import { ValidationLibrary } from '../../types/enums/ValidationLibrary.enum';
import { ProjectProbe } from '../ProjectProbe';

function createTempDir(t: TestContext, prefix: string): string {
    const generatedRoot = path.join(__dirname, 'generated');
    mkdirSync(generatedRoot, { recursive: true });
    const tempDir = mkdtempSync(path.join(generatedRoot, prefix));
    t.after(() => {
        rmSync(tempDir, { recursive: true, force: true });
    });
    return tempDir;
}

describe('@unit: ProjectProbe integration', () => {
    test('detects zod in package.json and loads consumer imports from generated entry', async t => {
        const tempDir = createTempDir(t, 'project-probe-');
        const apiDir = path.join(tempDir, 'generated');
        const srcDir = path.join(tempDir, 'src');
        mkdirSync(apiDir, { recursive: true });
        mkdirSync(srcDir, { recursive: true });

        writeFileSync(
            path.join(tempDir, 'package.json'),
            JSON.stringify(
                {
                    name: 'consumer-app',
                    dependencies: {
                        zod: '^3.23.0',
                    },
                },
                null,
                2
            )
        );

        const entryPath = path.join(apiDir, 'index.ts');
        const consumerPath = path.join(srcDir, 'app.ts');

        writeFileSync(entryPath, 'export function createClient() {}\n');
        writeFileSync(consumerPath, `import { createClient } from '../generated/index';\n`);

        const profile = ProjectProbe.probe({ dir: tempDir });

        assert.strictEqual(profile.dir, tempDir);
        assert.strictEqual(profile.packageJsonPath, path.join(tempDir, 'package.json'));
        assert.ok(profile.packageJson.packageJson.existingValidators.includes(ValidationLibrary.ZOD));

        profile.consumer.context.project.addSourceFileAtPath(entryPath);
        profile.consumer.context.project.addSourceFileAtPath(consumerPath);

        assert.ok(profile.consumer.context.getConsumerSourceFiles().some(file => file.getFilePath() === consumerPath));
    });
});
