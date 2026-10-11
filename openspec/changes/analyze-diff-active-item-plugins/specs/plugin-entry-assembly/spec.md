## MODIFIED Requirements

### Requirement: resolvePluginEntries replaces path-only resolve
CLI helper formerly returning path strings MUST be `resolvePluginEntries(openapiConfig, cliPlugins, activeInput?)` returning merged `NormalizedPluginEntry[]` (config-first, path dedupe). Config entries MUST be root `plugins` plus plugins of the **Active item** (the `items[]` entry whose `input` equals `activeInput` after both paths are made absolute). MUST NOT union every `items[].plugins`. When `activeInput` is omitted or no item matches, config entries MUST be root `plugins` only. When several items share the same absolute input, MUST merge those items’ plugins and emit a warning. `--compare-with` and git MUST NOT change the match.

#### Scenario: Config and CLI merged as entries
- **WHEN** config has `{ path: "./a.cjs", config: { x: 1 } }` and CLI passes `./b.cjs`
- **THEN** result is `[{ path: "./a.cjs", config: { x: 1 } }, { path: "./b.cjs", config: {} }]` (normalized shape)

#### Scenario: Active item plugins only
- **WHEN** two items have different absolute inputs and plugins `./item-a.cjs` and `./item-b.cjs`, and `activeInput` is the first item’s spec
- **THEN** config-side entries include `./item-a.cjs` and MUST NOT include `./item-b.cjs`

#### Scenario: No item match uses root plus CLI
- **WHEN** `--input` matches no `items[].input` after absolute comparison
- **THEN** loaded config plugins are root `plugins` only, then CLI `--plugins`

#### Scenario: Duplicate input merges and warns
- **WHEN** two items share the same absolute `input` and list different plugins
- **THEN** both items’ plugins are merged (path dedupe) and a warning is logged
