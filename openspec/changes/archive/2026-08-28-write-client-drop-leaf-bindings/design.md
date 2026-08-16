## Context

Leaf adapters уже сделали free `writeClient*(adapter, …)`. Facade bindings — YAGNI pass-through; только 4 test-файла их зовут.

## Goals / Non-Goals

**Goals:**
- Удалить все 9 leaf bindings с `WriteClient`
- Перевести leaf tests на adapter + free function
- Обновить main spec `write-client-leaf-adapters`

**Non-Goals:**
- Expected-files delta / narrow deps / index collapse
- In-memory adapter без WriteClient
- Change leaf write behavior

## Decisions

1. **Delete all nine** — Index* + Executor тоже (zero callers)
2. **Tests:** inline `new WriteClient().toCoreOutputAdapter()` — no shared helper
3. **Keep** `toCoreOutputAdapter` on facade — production + test seam

## Risks / Trade-offs

- [Main spec still requires facade leaf methods until sync] → Mitigation: delta REMOVED/MODIFIED in this change; sync on archive

## Migration Plan

1. Spec + tasks artifacts
2. Trim WriteClient; update 4 tests
3. Verify with real exit codes
4. CONTEXT OpenSpec id
