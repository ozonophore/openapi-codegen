## Context

`src/common/LoggerMessages.ts` is the single source of truth for all user-facing strings in the CLI and logging layer. The current branch (`PDTCH-000 Функционал Марадера`) added several new message groups (`HEAL.*`, `GENERATION.REUSE_SUMMARY`, `PRE_ANALYZE_*`, `SWARM_MANIFEST_CREATED`, `WORKSPACE_REPORT_CREATED`, `SHARED_FOLDER_SUMMARY`) that are already in English. However, the file still carries Russian strings in:

- All `LOGGER_ERROR_RECOMMENDATIONS` values (15 strings).
- Seven `LOGGER_MESSAGES.CONFIG.*` values (`FILE_NOT_FOUND`, `UPDATING_FAILED`, `CHECKING_FAILED`, `CONFIG_VALID`, `CONFIG_UP_TO_DATE`, `WARNING_OUTDATED_CONFIG`, `WARNING_DEFAULT_VALUES`).
- File-level and JSDoc comments (not runtime, but for consistency).

Beyond `LoggerMessages.ts` itself, three callers bypass the registry and embed Russian text directly:

| File | Lines | Kind |
|---|---|---|
| `src/core/OpenApiClient.ts` | 315, 325, 454 | `logger.warn(...)` with Russian literal |
| `src/cli/index.ts` | 163, 167 | CLI help description strings |
| `src/cli/checkAndUpdateConfig/constants.ts` | 6, 8, 11, 13, 16 | Interactive dialog labels |

The old commit (`efba83f`) did not have `HEAL.*` or the Marauder Swarm/Reuse message groups. These were introduced in the current branch and are already English — they are wired to callers in `src/core/OpenApiClient.ts`, `src/core/avatarSwarm/`, `src/core/reuseStore/`, etc.

## Goals / Non-Goals

**Goals:**

- All runtime string values in `LoggerMessages.ts` are in English after this change.
- The phrase `"соответствовать схеме V6"` is replaced with `"correspond to the current schema"` (version-agnostic).
- Hardcoded Russian strings in `OpenApiClient.ts`, `cli/index.ts`, and `constants.ts` are moved into `LoggerMessages.ts` and callers updated.
- JSDoc/comment translations in `LoggerMessages.ts` for internal consistency.

**Non-Goals:**

- Translating developer comments in files other than `LoggerMessages.ts`.
- Changing log levels, log output format, or logger call signatures.
- i18n / runtime locale switching.
- Removing or renaming any existing message keys (no public API breakage).

## Decisions

### D1 — Translate in-place, keep all keys

Keep every existing key. Change only the string value. This avoids any refactoring risk to callers and keeps the diff minimal.

*Alternative considered:* Rename Russian-named helper keys (e.g., `CONFIG_VALID`) to more explicit English names. Rejected — unnecessary churn, all keys are already English identifiers.

### D2 — New keys for OpenApiClient.ts Russian warn messages

Add three new keys under `LOGGER_MESSAGES.GENERATION` (or a new `REUSE` sub-group):

```
GENERATION.AUTO_GROUP_REQUIRES_REUSE_CACHE   // line 315
GENERATION.AUTO_GROUP_LCA_TRIVIAL_FALLBACK   // line 325
GENERATION.TRAFFIC_SPLITTER_MULTI_ITEM_WARN  // line 454
```

Replace `logger.warn('...')` literals with `LOGGER_MESSAGES.GENERATION.<KEY>`.

*Alternative considered:* Keep them inline in `OpenApiClient.ts`. Rejected — violates the "all user-facing strings in LoggerMessages" invariant established by the file's own header comment.

### D3 — New keys for CLI help strings (index.ts)

Add two keys under `LOGGER_MESSAGES.CLI` (new sub-group):

```
CLI.HELP_INPUT_DIR       // "Path to directory with spec files"
CLI.HELP_INTERACTIVE     // "Use interactive mode ... (default: false)"
```

Assign these as the `description` values in `yargs` option definitions.

### D4 — New keys for dialog labels (constants.ts)

Add a `LOGGER_MESSAGES.DIALOG_LABELS` sub-group (or extend `CONFIG`) with keys for each of the five interactive dialog strings. Replace the string literals in `constants.ts` with references.

### D5 — Phrase replacement: version-agnostic schema wording

`LOGGER_ERROR_RECOMMENDATIONS.CONFIG_VALIDATION_FAILED` currently says:
> "…имена полей и типы должны соответствовать схеме V6."

New English text (after translation + phrase replacement):
> "…field names and types must correspond to the current schema."

This makes the recommendation future-proof regardless of which schema version is current.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Callers of `LOGGER_MESSAGES.CONFIG.FILE_NOT_FOUND` etc. may rely on the Russian text in tests | Grep tests for the Russian strings before changing; update test assertions |
| `cli/index.ts` yargs descriptions are used in `--help` output which may be tested via snapshots | Check for CLI snapshot tests and update if present |
| `constants.ts` dialog labels may have consumer tests comparing string values | Audit test files for these string literals |

## Migration Plan

1. Translate all Russian runtime strings in `LoggerMessages.ts` in a single commit.
2. Add new keys (`GENERATION.*` warn messages, `CLI.*` help strings, `DIALOG_LABELS.*`).
3. Update call sites in `OpenApiClient.ts`, `cli/index.ts`, `constants.ts`.
4. Run `tsc --noEmit` and existing test suite to verify no regressions.
5. No rollback needed — purely additive string changes.
