## Context

`follow-after-ref` added `sourceFileAfterRef` and inlined `get` + `toCanonicalRef` + helper in every operation parser. Grill skipped a Follow package (one adapter = hypothetical seam). After the helper landed, seven call sites repeat the same dance. That is a real seam: Follow is lookup plus parent rebind, not Canonical Ref math.

## Goals / Non-Goals

**Goals:**

- Module `lookupAndFollow(lookup, node, parent) → { value, parent }`.
- Parsers for parameter, requestBody, response, path `$ref` call it.
- Tests through that interface (fake `get` / `toCanonicalRef`).
- ADR-0004: helper-only vs Context method vs this module.

**Non-Goals:**

- Moving `sourceFileAfterRef` off `canonicalRef.ts`.
- Context method wrapping Follow.
- Behavior change; headers/callbacks/links.

## Decisions

1. **Package `src/core/follow/`.** One export `lookupAndFollow`. Lookup host is a duck `{ get; toCanonicalRef }`. Context already matches. No second adapter.

2. **No `$ref` → identity.** `{ value: node, parent }` unchanged. Empty parent stays empty — still not Follow (inline schema parent is the caller’s Follow parent, already computed by the caller).

3. **`sourceFileAfterRef` stays Canonical Ref math.** Follow module calls it. Parser tests that already prove Follow remain; new tests cover the module only.

4. **ADR now.** Easy to reverse (move a function), but surprising after we just said “no package”, and the trade-off is real. Record it.

## Risks / Trade-offs

- [Shallow pass-through] → deletion test: without the module, seven parsers re-copy the dance and one will drop Follow again. Depth is “cannot forget the rebind”.
- [Context grows] → rejected; parsers pass `this.context` as the duck.

## Migration Plan

None. Bit-identical generate.
