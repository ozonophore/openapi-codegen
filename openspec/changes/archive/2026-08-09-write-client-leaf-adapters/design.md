## Context

Grilling locked CoreOutputAdapter (write + lint + logger duck), separate from ReuseOutputAdapter, all leaves + shared-core, first-arg adapter, thin facade methods, internal visibility.

## Goals / Non-Goals

**Goals:** Remove `this: WriteClient` from leaves; shared-core on adapter; project to ReuseOutputAdapter.

**Non-Goals:** IndexCombineWriteHost rethink; narrow item/batch deps; merge Reuse type; behavior/log changes.

## Decisions

1. `CoreOutputAdapter` in `CoreOutputAdapter.ts` with free `toCoreOutputAdapter` + `WriteClient.toCoreOutputAdapter()`
2. `toReuseOutputAdapter(core, defaultLintRoot?)` in same file
3. Leaf signature `fn(adapter, options)`; facade wrappers preserve public call shape
4. Logger duck `{ info; warn }`
5. `registerLintTarget(file, outputRoot)` required on Core

## Risks / Trade-offs

- Test signature updates for shared-core mocks — mechanical

## Open Questions

_(none)_
