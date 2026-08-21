## Why

`plugin-config-inject` wired `configure` for generate/preAnalyze, but analyze-diff still strips entry `config` via `extractPluginPaths` before `loadGeneratorPlugins`. Architecture candidate #7: align plugin entry assembly so semantic-diff plugins receive the same config as generation plugins.

## What Changes

- `resolvePluginPaths` → `resolvePluginEntries` returning `NormalizedPluginEntry[]` (merge config+CLI, no path-only strip).
- `analyzeDiff` passes full entries to `loadGeneratorPlugins`.
- Docs: `configure` also applies on analyze-diff load failures.
- Delta: `analyze-diff-cli-plugins` returns entries, not path strings.
- `extractPluginPaths` stays for check-config path existence warnings only.

## Capabilities

### New Capabilities

- `plugin-entry-assembly`: analyze-diff loads full plugin entries (path+config) like generate.

### Modified Capabilities

- `analyze-diff-cli-plugins`: resolve helper returns normalized entries; configure runs for non-empty config.

## Impact

- `src/cli/analyzeDiff/pluginPaths.ts`, `analyzeDiff.ts`, tests, docs en/ru
- No public core API rename (`extractPluginPaths` / `mergePluginPaths` unchanged)
