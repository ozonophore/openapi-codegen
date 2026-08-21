## Context

After `plugin-config-inject`, generate/preAnalyze pass `NormalizedPluginEntry[]`. analyze-diff still did `extractPluginPaths(merge…)` → string[] → empty config → `configure` never runs for config-object plugins on diff hooks.

## Goals / Non-Goals

**Goals:** Same entry assembly seam for analyze-diff load; preserve union(root+items)+CLI merge/dedupe; docs accurate.

**Non-Goals:** Active-item filter by `--input`; CLI object-shaped `--plugins`; Plugin API v3; change check-config `extractPluginPaths` usage; Session/Write/options/Spec-load.

## Decisions

1. Rename CLI helper `resolvePluginPaths` → `resolvePluginEntries(): NormalizedPluginEntry[]` (CLI-internal; no core export).
2. Drop `extractPluginPaths` from analyze-diff assembly; keep `mergePluginPaths` + `collectConfigPluginEntries`.
3. Dedupe: first wins by resolved path (existing `mergePluginPaths`); conflicting configs for same path not merged.
4. CLI `--plugins` remain string paths (empty config).
5. `configure` throw fails analyze-diff load (same as generate).

## Risks / Trade-offs

- Plugins that only ran on analyze-diff and ignored hashed config now get `configure` → intended alignment.

## Migration Plan

Internal. Rollback: revert CLI helper.

## Open Questions

_(none)_
