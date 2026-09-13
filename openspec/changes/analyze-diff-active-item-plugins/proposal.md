## Why

`analyze-diff` loads the union of every `items[].plugins`. Hooks from unrelated specs run on the spec passed as `--input`. Intended contract: plugins of the **Active item** (absolute `--input` match) plus root and CLI. Should-fix (does not hold the 2.1.0 tag); product copy is `document-210-release-contract`.

## What Changes

- Match config `items[]` to `analyze-diff --input` after both paths are absolute.
- Plugin load = root `plugins` + Active item `plugins` + CLI `--plugins` (config-first, path dedupe).
- No match → root + CLI only.
- Several items share the same absolute input → merge their plugins and warn.
- Git / `--compare-with` do not change the match.
- Object-shaped CLI `--plugins` stays out of scope.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `plugin-entry-assembly`: `resolvePluginEntries` no longer unions every `items[].plugins`; it uses Active item (or root+CLI on miss).
- `analyze-diff-cli-plugins`: document Active item as the config source for analyze-diff plugin load.

## Impact

- `src/cli/analyzeDiff/pluginPaths.ts` (`resolvePluginEntries`, `collectConfigPluginEntries`)
- `src/cli/analyzeDiff/analyzeDiff.ts` (pass absolute `--input`)
- Tests: `pluginPaths.test.ts` (match / miss / duplicate input / CLI merge)
- Glossary term already in `CONTEXT.md`: **Active item**
