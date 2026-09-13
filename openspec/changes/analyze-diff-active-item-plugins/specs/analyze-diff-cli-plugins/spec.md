## ADDED Requirements

### Requirement: analyze-diff passes Active item input into plugin resolve
`analyze-diff` MUST pass the absolute `--input` path into `resolvePluginEntries` as `activeInput`. Plugin load for the command MUST follow Active item rules (root + matching item + CLI). Git and `--compare-with` MUST NOT be used as the match key.

#### Scenario: CLI analyze-diff uses --input for item match
- **WHEN** user runs `analyze-diff --input ./new.yaml --compare-with ./old.yaml` with a multi-item openapi config
- **THEN** plugin resolve receives the absolute path of `./new.yaml` and loads that item’s plugins, not the union of all items
