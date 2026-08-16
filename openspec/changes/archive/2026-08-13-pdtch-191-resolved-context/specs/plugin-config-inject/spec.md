## ADDED Requirements

### Requirement: Plugin configure receives non-empty config
Loader MUST accept plugin entries with path and config (not only string paths). After loading a plugin object, if it defines `configure` and the entry config has at least one own key, loader MUST await `configure(config)`. Empty config (string path entry) MUST NOT call `configure`. A throw from `configure` MUST fail plugin loading. Generate and preAnalyze MUST pass full entries so config is not stripped before load.

#### Scenario: Non-empty config is injected
- **WHEN** config entry is `{ path: "./p.cjs", config: { mode: "strict" } }` and plugin exports `configure`
- **THEN** loader calls `configure({ mode: "strict" })` before returning the plugin

#### Scenario: String path skips configure
- **WHEN** entry is `"./p.cjs"` (normalized config `{}`)
- **THEN** loader MUST NOT call `configure` even if the method exists

#### Scenario: configure throw is fatal
- **WHEN** `configure` throws
- **THEN** `loadGeneratorPlugins` rejects / throws and generation fails
