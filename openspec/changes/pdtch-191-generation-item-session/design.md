## Context

HEAD after resolved-context: `generateSingle` still on `OpenApiClient`. Facade is `generate(rawOptions)` with lazy `WriteClient` — **not** TRANS ctor-injected `rawOptions`. Batch already injects `generateItem`.

Grilling (PDTCH-191 phase 1, a57): move full pipeline; keep HEAD generate() wiring (construct item session inside `generate` after WriteClient exists). Do not copy TRANS ctor.

## Goals / Non-Goals

**Goals:**
- One module owns per-item lifecycle
- Facade shrinks to normalize/defaults + wire sessions
- Preserve batch callback seam
- Behavioral preserve

**Non-Goals:**
- Collapsing V2/V3 arms
- Diff report package / WriteClient split / options resolve
- Ctor-injected OpenApiClient
- Dedicated item-session unit suite
- Public export from `src/core/index.ts`

## Decisions

### Decision 1: Class `GenerationItemSession`
`run(item, generationCache, itemRunContext)` with deps `{ writeClient, eslintFixOptions }`. Mirrors batch session.

### Decision 2: Full pipeline moves; `generateSingle` deleted
EntitySkip (+ registerOutputFile on hit) → plugins / createResolvedContext → spec analysis / strict → templates → Diff → V2/V3 → ReuseWriterContext → writeClient → GenerationCache.set. Diff helpers private on item session.

### Decision 3: HEAD wiring
Construct item session **inside** `OpenApiClient.generate(rawOptions)` after WriteClient is created. Do not add a constructor that takes `rawOptions`.

```ts
const itemSession = new GenerationItemSession({
  writeClient: this.writeClient,
  eslintFixOptions: this.eslintFixOptions,
});
generateItem: (item, generationCache, itemRunContext) =>
  itemSession.run(item, generationCache, itemRunContext),
```

Batch does not import item session.

### Decision 4: `ItemRunContext` required
Match `generateItem` contract.

### Decision 5: V2/V3 as-is
Move switch unchanged (HEAD has no extra default throw).

### Decision 6: Visibility / tests
Internal. Existing suites are the gate.

## Risks / Trade-offs

- **[Risk] Accidental ctor rewrite from TRANS** → Keep `generate(rawOptions)` + lazy WriteClient
- **[Risk] Missed `this.writeClient` leftover** → Compile + `rg generateSingle src/`

## Migration Plan

- Internal only
- Rollback: revert

## Open Questions

_(none)_
