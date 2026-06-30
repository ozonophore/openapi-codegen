---
name: marauder-openapi-codegen
description: >-
  Guides AI agents on openapi-codegen Marauder preview (2.1.0-beta.11+): auto-select,
  spec analysis, reuse cache, config schema V6. Use when the user asks about --auto-select,
  --spec-analysis, autoSelect, specAnalysis, cacheStrategy reuse, or Marauder config.
---

# Marauder — agent cheatsheet

**Canonical human docs:** `node_modules/ts-openapi-codegen/docs/MARAUDER_USER_GUIDE.md` · [GitHub](https://github.com/ozonophore/openapi-codegen/blob/master/docs/MARAUDER_USER_GUIDE.md)

Marauder is the **preview** feature set in `openapi-codegen-cli`. All features are **opt-in** via config schema **V6**.

**Removed in 2.1.0-beta.11 refocus (do not recommend):** CLI commands `heal`, `migrate`, `swarm`; flag `--exploit-anomalies`; config `anomalyExploitation`.

## Quick decision

```
Pick httpClient/validator from package.json → generate --auto-select
Scan spec quality before merge / CI gate     → generate --spec-analysis
Multi-spec shared model/schema artifacts     → cache: true, cacheStrategy: "reuse"
Full quality chain                           → analyze-diff → generate (strict + spec-analysis) → analyze-usage
```

## Execution mode

| Mode | Commands | What runs |
|------|----------|-----------|
| Codegen / reports | `generate` | Writes client + reports — **no** runtime side effects |

Marauder does **not:** auto-fix specs, switch production traffic, or sync remote spec URLs.

## Agent workflow

1. Identify goal → pick flag/block from decision tree
2. If config is pre-V6: `openapi-codegen-cli update-config -ocn openapi.config.json`
3. Provide concrete command + minimal config snippet
4. State preview limitations (reports only, manual integration)
5. For RequestExecutor / HTTP layer → use `request-executor-openapi-codegen` skill instead

## Config blocks (summary)

| Block | CLI | Purpose |
|-------|-----|---------|
| `autoSelect` | `--auto-select` | Analyze `package.json` → recommend `httpClient` / `validationLibrary` |
| `specAnalysis` | `--spec-analysis` | Per-spec + cross-spec quality report; optional CI gate |
| `cache` + `cacheStrategy: "reuse"` | `--cache --cacheStrategy reuse` | Shared artifact store across multi-spec runs |

See [reference.md](reference.md) for field tables.

## Common questions

**Why didn't generate fail on spec issues?**  
`failOnHigh` / `fail-on-high` gates on **high** severity only. Medium/low do not fail.

**Auto-select picked wrong client?**  
Ensure `package.json` is in the analysis directory (usually output dir). Use `autoSelect.strict: true` to limit to detected deps.

**specAnalysis vs deprecated anomalyDetection?**  
`specAnalysis` is canonical (V6). Deprecated alias `anomalyDetection` may still parse — prefer `specAnalysis` in new configs.

## Additional resources

- [reference.md](reference.md) — V6 field tables
- [examples.md](examples.md) — copy-paste commands and config
- RequestExecutor (separate concern): [request-executor skill](../request-executor-openapi-codegen/SKILL.md)
