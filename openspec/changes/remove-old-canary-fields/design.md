## Context

Traffic Splitter is Preview. Schema and types still carry `oldClientWeight` and `headerValues.old`. Runtime (`TrafficSplitter.ts`, generated module) reads only `newClientWeight` and `headerValues.new`. Example config shows `oldClientWeight: 80` next to `newClientWeight: 20`, which looks like a 80/20 split but the helper never uses 80.

Grill: Q11 remove `oldClientWeight`, Q17 remove `headerValues.old`. Glossary: **Canary weight**, **Canary header value**.

## Goals / Non-Goals

**Goals:**

- Schema, types, emit, CLI dot-notation, and `example/openapi.marauder.config.json` drop the dead fields.
- `headerValues` is `{ new: string }` only.
- Existing routing math unchanged (`hash % 100 < newClientWeight`; header equals `.new`).

**Non-Goals:**

- Live traffic / proxy.
- Adding `oldClientWeight` semantics “to be honest.”
- Product migration essay (sibling `document-210-release-contract`).
- Changing default `newClientWeight` meaning.

## Decisions

1. **Delete, do not implement old weight.** Implementing it would invent a second knob (`100 - new`). One field is the contract.

   Alternative: keep fields, document as unused — rejected (Q11/Q17). Lying schema is the Defect.

2. **`headerValues.new` required if `headerValues` is present; `old` unknown key.** Zod object without `.old`. Configs that still pass `old` fail validation (preview **BREAKING**).

   Alternative: strip `old` with a warn — rejected; leftover keys hide the delete.

3. **Example: drop `oldClientWeight`, keep `newClientWeight: 20`.** No need to add `headerValues` unless we already demonstrate header strategy (example is weighted).

4. **CLI `--traffic-splitter.oldClientWeight` goes away** with the schema field. Dot-notation for `headerValues.old` likewise.

## Risks / Trade-offs

- **[Risk] Preview users have `oldClientWeight` in config** → validate fail. Small surface; Preview + sibling migration note.
- **[Risk] Generated `TrafficSplitter.ts` snapshots mention old fields** → update snapshots.
- **[Trade-off] `headerValues` name stays plural** → keep; only `.new` is meaningful.

## Migration Plan

Remove the two fields from configs. Rollback: restore schema keys (still unused at runtime).

## Open Questions

_(none — Q11/Q17)_
