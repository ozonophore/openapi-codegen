### Requirement: LOGGER_MESSAGES is for logger output only
`LOGGER_MESSAGES` and `LOGGER_ERROR_RECOMMENDATIONS` in `src/common/LoggerMessages.ts` are the single source of truth exclusively for strings that flow through the `logger` object (`logger.info`, `logger.warn`, `logger.error`, etc.). UI labels (interactive dialog choices, hints), CLI option description strings, and other non-logger text SHALL NOT be placed in `LOGGER_MESSAGES`. Such strings belong inline at their point of use or in a dedicated UI constants file.

#### Scenario: CLI option descriptions are not sourced from LOGGER_MESSAGES
- **WHEN** `src/cli/index.ts` defines a `yargs`/`commander` option description
- **THEN** the description is a plain string literal, not a `LOGGER_MESSAGES.*` reference

#### Scenario: Interactive dialog labels are not sourced from LOGGER_MESSAGES
- **WHEN** `src/cli/checkAndUpdateConfig/constants.ts` defines `EnquirerSelectChoice` entries
- **THEN** `name`, `hint`, and similar UI-label fields are plain string literals, not `LOGGER_MESSAGES.*` references

### Requirement: All runtime strings in LoggerMessages are English
`LOGGER_MESSAGES` and `LOGGER_ERROR_RECOMMENDATIONS` in `src/common/LoggerMessages.ts` SHALL contain no Cyrillic characters in any string value (function bodies, template literals, or plain strings). Comments and JSDoc within the file SHOULD also be in English.

#### Scenario: No Cyrillic in LoggerMessages string values
- **WHEN** the file `src/common/LoggerMessages.ts` is scanned for Cyrillic characters in runtime string values
- **THEN** zero matches are found

#### Scenario: LOGGER_ERROR_RECOMMENDATIONS values are English
- **WHEN** a CLI error occurs and the logger outputs a recommendation string from `LOGGER_ERROR_RECOMMENDATIONS`
- **THEN** the displayed text is in English

### Requirement: Version-agnostic config validation error recommendation
`LOGGER_ERROR_RECOMMENDATIONS.CONFIG_VALIDATION_FAILED` SHALL NOT reference a specific schema version number. The recommendation MUST use the phrase "current schema" instead of a versioned reference (e.g., "V6").

#### Scenario: CONFIG_VALIDATION_FAILED does not mention schema version
- **WHEN** `LOGGER_ERROR_RECOMMENDATIONS.CONFIG_VALIDATION_FAILED` is read
- **THEN** it does not contain the string "V6" or any other specific version identifier

### Requirement: CONFIG messages are English
All string values under `LOGGER_MESSAGES.CONFIG` SHALL be in English.

#### Scenario: CONFIG.FILE_NOT_FOUND is English
- **WHEN** a config file is not found and `LOGGER_MESSAGES.CONFIG.FILE_NOT_FOUND` is called
- **THEN** the returned string is in English

#### Scenario: CONFIG warning messages are English
- **WHEN** `WARNING_OUTDATED_CONFIG` or `WARNING_DEFAULT_VALUES` is displayed via logger
- **THEN** the text is in English

### Requirement: Hardcoded logger strings are centralized in LoggerMessages
`src/core/OpenApiClient.ts` SHALL NOT contain inline string literals passed to `logger.warn`. Such strings MUST be centralized in `LOGGER_MESSAGES.*` keys.

#### Scenario: auto-group cache strategy warning uses LoggerMessages
- **WHEN** `reuseMode: auto-group` is used without `cacheStrategy: reuse`
- **THEN** `logger.warn` is called with `LOGGER_MESSAGES.GENERATION.AUTO_GROUP_REQUIRES_REUSE_CACHE`

#### Scenario: auto-group LCA trivial fallback warning uses LoggerMessages
- **WHEN** the LCA node is trivial during auto-group resolution
- **THEN** `logger.warn` is called with `LOGGER_MESSAGES.GENERATION.AUTO_GROUP_LCA_TRIVIAL_FALLBACK`

#### Scenario: trafficSplitter multi-item warning uses LoggerMessages
- **WHEN** `trafficSplitter` is configured with a multi-item config
- **THEN** `logger.warn` is called with `LOGGER_MESSAGES.GENERATION.TRAFFIC_SPLITTER_MULTI_ITEM_WARN`

### Requirement: CLI option descriptions are English inline strings
`src/cli/index.ts` SHALL NOT contain inline Russian string literals for commander option descriptions. Descriptions MUST be plain English string literals at the point of use.

#### Scenario: init command option descriptions are English
- **WHEN** user runs `openapi-codegen-cli init --help`
- **THEN** all option descriptions are in English

### Requirement: Interactive dialog labels are English inline strings
`src/cli/checkAndUpdateConfig/constants.ts` SHALL NOT contain inline Russian string literals for interactive dialog choices. Labels MUST be plain English string literals at the point of use.

#### Scenario: Interactive config dialog labels are in English
- **WHEN** the interactive config check/update dialog is presented to the user
- **THEN** all choice labels and hint texts are in English
