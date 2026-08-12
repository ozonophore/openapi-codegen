# Domain context

Glossary for architecture and generation. Prefer these names over file/class nicknames when talking about seams.

## Generation batch session

Owns the **multi-item Generation lifecycle** for one `generate()` run: cache / ReuseStore setup, warm preAnalyze entity-skip pass, per-item orchestration, index combine, post-generation steps, Spec analysis finalize, Reuse GC/save, Generation report finalize, workspace report, stale cleanup, batch ESLint.

- **Module:** `GenerationBatchSession` (`src/core/GenerationBatchSession.ts`)
- **Deps:** `writeClient`, `eslintFixOptions`, `generateItem`, `shouldEntitySkip`
- **Does not own:** per-item parse → Client → Write (`generateSingle` stays on `OpenApiClient`)
- **Seam to per-item:** callbacks (`generateItem` → `{ entitySkipped }`, `shouldEntitySkip`); Spec analysis accumulator lives on the session and is passed inside **`itemRunContext`** (reuse fields + accumulator) — not a separate argument
- **Visibility:** internal module (not re-exported from `src/core/index.ts`), same as `OpenApiClient`
- **Logger:** `shutdownLogger` stays at the end of the session success path (behavioral preserve)
- **Report order:** early dump on Reuse conflict (may omit final phases); success path is **Reuse GC/save → final Generation report → workspace report** so `phases` timings are honest when `cacheDebug`
- **Gates:** when all items `entitySkipped`, skip index combine and batch ESLint (clear lint targets)
- **OpenSpec change:** `pdtch-191-generation-batch-session`

## Related terms

| Term | Role |
|------|------|
| **OpenApiClient** | Facade: options normalize/defaults, `generateSingle`, entity-skip/fingerprint helpers; constructs and runs the batch session |
| **WriteClient** | Output session: write artifacts, expected-file registry, lint targets, index combine |
| **ReuseStore** | Artifact reuse manifest under cache strategy `reuse` |
| **GenerationCache** | Entity/content cache entries per output root |
| **Context** | Parse-time Spec context (refs, virtual file map, plugins) — not passed to WriteClient |
| **Generator plugins** | Loaded into Context during per-item generation / preAnalyze |
