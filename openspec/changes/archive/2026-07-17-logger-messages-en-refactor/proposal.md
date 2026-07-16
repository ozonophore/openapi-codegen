## Why

`LoggerMessages.ts` still contains Russian-language strings for user-facing messages (error recommendations, CONFIG warnings, a handful of template-style strings), while the rest of the file is already in English. Additionally, several hardcoded Russian strings live outside `LoggerMessages.ts` (in `src/cli/index.ts`, `src/cli/checkAndUpdateConfig/constants.ts`, and `src/core/OpenApiClient.ts`), bypassing the centralised message registry. The current branch also added new message groups (`HEAL`, `GENERATION.REUSE_SUMMARY`, `PRE_ANALYZE_*`, `SWARM_MANIFEST_CREATED`, etc.) that need review and wiring into callers. Bringing everything to English now, before more features ship, minimises translation debt and ensures a single language contract for the entire logging layer.

## What Changes

- Translate all remaining Russian strings in `src/common/LoggerMessages.ts` to English (covers `LOGGER_ERROR_RECOMMENDATIONS`, several `CONFIG.*` values, and the file-level comment block).
- Replace the hardcoded phrase `"соответствовать схеме V6"` → `"correspond to the current schema"` (English translation of `"соответствовать актуальной схеме"`).
- Extract three hardcoded Russian `logger.warn` strings from `src/core/OpenApiClient.ts` into new `LOGGER_MESSAGES.GENERATION.*` or `LOGGER_MESSAGES.REUSE.*` keys and replace call sites.
- Extract two Russian CLI help strings from `src/cli/index.ts` into `LOGGER_MESSAGES.CLI.*` or equivalent keys.
- Extract five Russian interactive-dialog strings from `src/cli/checkAndUpdateConfig/constants.ts` into `LOGGER_MESSAGES.CONFIG.*` or a new `LOGGER_MESSAGES.DIALOG_LABELS.*` group and replace call sites.
- Verify that new message keys added in the current branch (`HEAL.*`, `GENERATION.WORKSPACE_REPORT_CREATED`, `GENERATION.SWARM_MANIFEST_CREATED`, `GENERATION.REUSE_SUMMARY`, `GENERATION.PRE_ANALYZE_*`, `GENERATION.SHARED_FOLDER_SUMMARY`) are actually wired into their callers (or document the ones that are not yet used).

## Capabilities

### New Capabilities

- `logger-messages-english`: All user-facing log/error/dialog strings in `LoggerMessages.ts` and its consumers are in English; no Cyrillic characters remain in runtime string values across `src/`.

### Modified Capabilities

- `generate-cli-marauder-flags`: `LOGGER_ERROR_RECOMMENDATIONS.CONFIG_VALIDATION_FAILED` wording updated (schema version phrasing made version-agnostic).

## Impact

- `src/common/LoggerMessages.ts` — all string values translated; one wording change to `CONFIG_VALIDATION_FAILED`.
- `src/core/OpenApiClient.ts` — three `logger.warn(...)` call sites refactored to use `LOGGER_MESSAGES.*` keys.
- `src/cli/index.ts` — two CLI help text values replaced with `LOGGER_MESSAGES.*` references.
- `src/cli/checkAndUpdateConfig/constants.ts` — five dialog-label strings replaced with `LOGGER_MESSAGES.*` references.
- No public API changes; no breaking changes to generated clients.
