#!/usr/bin/env node
/**
 * Sync npm-published skills/ into .cursor/skills/ for maintainer repo development.
 */
import { cp, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const SOURCE = join(ROOT, 'skills');
const TARGET = join(ROOT, '.cursor', 'skills');

async function main(): Promise<void> {
  await mkdir(join(ROOT, '.cursor'), { recursive: true });
  await rm(TARGET, { recursive: true, force: true });
  await cp(SOURCE, TARGET, { recursive: true });
  console.log(`Synced ${SOURCE} → ${TARGET}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
