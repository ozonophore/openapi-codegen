#!/usr/bin/env node
/**
 * Lint Agent Skills for consumer-project portability.
 * Fails if skill markdown files reference maintainer-only repo paths.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const SKILLS_DIR = join(ROOT, 'skills');

const FORBIDDEN_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bsrc\/templates\//, label: 'src/templates/' },
  { pattern: /\bsrc\/core\//, label: 'src/core/' },
  { pattern: /\bsrc\/cli\//, label: 'src/cli/' },
  { pattern: /\bsrc\/common\//, label: 'src/common/' },
  { pattern: /\btest\//, label: 'test/' },
  { pattern: /\bexample\//, label: 'example/' },
  { pattern: /\.cursor\//, label: '.cursor/' },
  { pattern: /graphify-out\//, label: 'graphify-out/' },
  { pattern: /(?<![/\w])MIGRATION\.md(?![/\w])/, label: 'MIGRATION.md (use node_modules/ prefix or docs/en/migration.md)' },
  { pattern: /(?<![/\w])CHANGELOG\.md(?![/\w])/, label: 'CHANGELOG.md (use node_modules/ prefix)' },
  { pattern: /MARAUDER_UNFINISHED_FEATURES/, label: 'MARAUDER_UNFINISHED_FEATURES.md' },
];

async function collectMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main(): Promise<void> {
  const files = await collectMarkdownFiles(SKILLS_DIR);
  const violations: string[] = [];

  for (const file of files) {
    const content = await readFile(file, 'utf8');
    const rel = relative(ROOT, file);

    // README files document install paths (e.g. .cursor/skills/) for humans
    if (rel === 'skills/README.md') {
      continue;
    }

    for (const { pattern, label } of FORBIDDEN_PATTERNS) {
      if (pattern.test(content)) {
        violations.push(`${rel}: forbidden reference "${label}"`);
      }
    }
  }

  if (violations.length > 0) {
    console.error('Skills portability lint failed:\n');
    for (const v of violations) {
      console.error(`  - ${v}`);
    }
    console.error('\nSkills must be self-contained for consumer projects.');
    console.error('Use node_modules/ts-openapi-codegen/docs/ or inline snippets instead.');
    process.exit(1);
  }

  console.log(`Skills portability OK (${files.length} files checked).`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
