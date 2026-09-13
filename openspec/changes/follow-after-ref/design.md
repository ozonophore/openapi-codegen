## Context

PDTCH-200 made `$ref` lookup URI+intern and rebased **Response** nested parse on the Canonical Ref source file (task 4.2). Parameters, requestBody, and inline parameter schemas still pass the operation’s Parent source file (or `''`) into nested `$ref` lookup. `CONTEXT.md` **Follow** names the missing invariant.

## Goals / Non-Goals

**Goals:**

- Follow after parameter `$ref` (OAS2/OAS3), requestBody `$ref` (OAS3), and inline parameter schema parse.
- One named helper: `sourceFileAfterRef(canonicalRef, fallbackParent)` in `canonicalRef.ts`.
- Responses and path `$ref` (services) call the same helper.
- Fixture: parameter and requestBody in another file with a nested relative Tree `$ref`.

**Non-Goals:**

- New Follow package / Context method.
- Auto-wire `createLegacyRequestAdapter`; DTO nullable; `getRelativeModelPath` `../`; Upgrade page.
- Headers/callbacks/links `$ref` parse (generation still ignores those as `$ref` objects).
- Changing `$ref` lookup, ADR-0001, or Schema Model denylist.

## Decisions

1. **Helper takes a Canonical Ref, not a Tree `$ref`.** Parsers already have `context.toCanonicalRef(treeRef, parent)`. Follow is “source file of that identity”. Alternative: Context wrapper — rejected; Context stays a bag. Alternative: copy four lines — rejected; that is how parameters missed Follow.

2. **Fallback is the pre-Follow Parent source file.** If `splitCanonicalRef` yields an empty source file (pointer-only Canonical Ref), keep the caller parent. Matches current responses: `splitCanonicalRef(...).sourceFile || parentSourceFile`.

3. **Inline schema uses the Follow parent of the parameter object**, the same string passed into `getOperationParameter`. Empty `parentRef: ''` is not Follow.

4. **Tests hit generate or createResolvedContext + Parser**, not a mocked `get`. Same-file `#/components/...` fixtures stay green without proving Follow.

## Risks / Trade-offs

- [Same-file specs hide the bug] → Fixture MUST put the component in a **different** file than the operation.
- [v2 `getType(..., '')` for JSON Schema `type` names] → Those strings are type names, not Tree `$refs`; do not “fix” them as Follow.
- [Helper name in CONTEXT.md] → Glossary stays **Follow**; function name is implementation.

## Migration Plan

Bugfix on 2.1.0. CHANGELOG Fixed. Regen for anyone who generated from a beta with split parameter/requestBody files — not an Upgrade page item.
