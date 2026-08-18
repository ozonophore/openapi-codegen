## ADDED Requirements

### Requirement: analyze-diff loads full plugin entries
analyze-diff MUST resolve config + CLI plugins into `NormalizedPluginEntry[]` (path + config) and pass them to `loadGeneratorPlugins` without stripping `config` via `extractPluginPaths`. Non-empty entry config MUST invoke plugin `configure` when present; a throw MUST fail the run.

#### Scenario: Object entry config reaches configure on analyze-diff
- **WHEN** openapi config lists `{ path: "./hooks.cjs", config: { mode: "strict" } }` and the plugin exports `configure`
- **THEN** analyze-diff load calls `configure({ mode: "strict" })` before semantic hooks

#### Scenario: CLI string plugins still load
- **WHEN** user passes `--plugins ./hooks.cjs` with no config object
- **THEN** plugin loads with empty config and `configure` is not called

---

### Requirement: resolvePluginEntries replaces path-only resolve
CLI helper formerly returning path strings MUST be `resolvePluginEntries(openapiConfig, cliPlugins)` returning merged `NormalizedPluginEntry[]` (config-first, path dedupe, union of root + all items plugins).

#### Scenario: Config and CLI merged as entries
- **WHEN** config has `{ path: "./a.cjs", config: { x: 1 } }` and CLI passes `./b.cjs`
- **THEN** result is `[{ path: "./a.cjs", config: { x: 1 } }, { path: "./b.cjs", config: {} }]` (normalized shape)
