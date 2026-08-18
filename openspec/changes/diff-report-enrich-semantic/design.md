## Context

CLI `analyzeDiff` sequences hooks, ignore, governance, miracles then `produceUnifiedDiffReport`. Produce Non-Goal: do not stuff enrich into produce. Ignore filter currently lives in CLI (`ignoreSemanticChanges.ts`).

## Goals / Non-Goals

**Goals:** One async enrich interface in Diff report; move ignore match/filter into package; thin CLI.

**Non-Goals:** Enrich inside produce; Spec load / analyze / write / CI in enrich; `loadIgnoreRules` / `loadGovernanceConfig` / plugin resolve in enrich.

## Decisions

1. Module: `enrichSemanticDiffReport.ts` → `{ report, ignored, reportPath }`
2. Order: hooks → ignore → governance + miracles (overwrite governance/miracles on report)
3. Ignore: move filter + matchesIgnoreRule + types; CLI load only
4. Export from `diffReport/index.ts` only

## Risks / Trade-offs

- [core Diff report depends on plugins apply hooks] → Accept; already a Diff lifecycle concern
- [matchesIgnoreRule uses APP_LOGGER for invalid pattern] → Preserve behavior

## Open Questions

_(none)_
