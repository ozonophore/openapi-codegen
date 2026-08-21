## Context

Options resolve owns item meaning; batch still leaked full `TRawOptions`. Five fields used by batch/finalize are not in `ROOT_ONLY_KEYS`, so item defaults do not carry user root values.

## Goals / Non-Goals

**Goals:**
- Narrow typed `root` at resolve seam
- Batch/finalize stop taking `TRawOptions`
- Bit-identical `items[]`

**Non-Goals:**
- Inherit five fields into items
- Normalize defaults inside bag
- Export from `core/index`
- Batch setup extract

## Decisions

1. Resolve returns `{ items, root }` (one meaning owner)
2. Bag = five fields only, raw-as-is
3. Type + private project in `resolveGenerationOptions.ts`
4. Rename session/finalize param to `root`
5. OpenApiClient keeps full raw for ctor (logger/eslint) + resolve input

## Risks / Trade-offs

- [Risk] Callers forget `.items` → Mitigation: field-lists test update; tsc catches OpenApiClient
- [Risk] Future root field forgotten → Mitigation: add to Pick when second consumer appears

## Migration Plan

- Change return type → rewire facade/batch/finalize → update tests → verify
