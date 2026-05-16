# 2.1.0-beta.5: New functionality overview

## Summary
Version `2.1.0-beta.5` introduces generation cache support and incremental file writes to speed up repeated runs and reduce unnecessary filesystem churn.

## What is new

### 1. Generation cache controls
New options are available in CLI and config:

- `cache` (default: `true`)
- `cachePath` (default: `.openapi-codegen-cache.json`)
- `cacheStrategy` (`entity` or `content`, default: `entity`)
- `cacheDebug` (default: `false`)

CLI equivalents:

- `--no-cache`
- `--cachePath <value>`
- `--cacheStrategy <entity|content>`
- `--cacheDebug`

### 2. Persistent cache storage
A new internal module `GenerationCache` stores per-item cache entries:

- cache key (depends on input and output topology);
- fingerprint (spec content + generator version + key generation options);
- list of generated files;
- update timestamp.

Cache is saved to JSON at `cachePath` and reused on subsequent runs.

### 3. Two caching strategies

#### `entity` strategy
- On cache hit, item generation is skipped completely.
- Existing generated files are validated and re-registered in output tracking.
- On cache miss, generation runs normally and cache is updated.

This strategy gives maximum acceleration for repeated runs with unchanged inputs/options.

#### `content` strategy
- Generation still executes.
- File writes are content-aware, so unchanged files are not rewritten.

This strategy is useful when full generation flow is desired but filesystem writes should be minimized.

### 4. Incremental write layer (`writeFileIfChanged`)
All major write paths now use content-aware writing:

- if file content is unchanged, the file is not rewritten;
- if content differs, file is rewritten;
- write stats are collected (`written`, `unchanged`).

Result: stable mtimes for unchanged outputs and cleaner incremental behavior in CI/local workflows.

### 5. Selective stale-file cleanup
Output cleanup logic was redesigned:

- removed full output directory deletion before each generation item;
- introduced post-generation selective cleanup based on the tracked set of expected output files.

This protects shared outputs in multi-item generation and avoids wiping valid files between items.

### 6. CLI options merge fix
Direct CLI generation now preserves cache-related flags while merging validated options with migrated config values. This ensures CLI-provided cache behavior is not lost during migration/normalization.

### 7. Schema and defaults updates

- Unified schema `UNIFIED_OPTIONS_v5` now includes cache fields.
- `generate` command validation schema includes cache fields.
- Default values in constants:
  - `cache: true`
  - `cachePath: .openapi-codegen-cache.json`
  - `cacheStrategy: entity`
  - `cacheDebug: false`

### 8. Dependency cleanup
Removed unused dev dependency: `ts-prune`.

## Test coverage added
New tests in `test/cacheGeneration.test.ts` verify:

- warm run with `entity` does not rewrite unchanged files;
- spec mutation invalidates cache and rewrites affected output;
- warm run with `content` keeps unchanged file mtime;
- multi-item generation with shared output keeps files stable and preserves multiple cache entries.

## Practical impact

- Faster repeated generation runs.
- Fewer unnecessary file writes.
- More stable generated directories in multi-item setups.
- Better incremental developer and CI experience.
