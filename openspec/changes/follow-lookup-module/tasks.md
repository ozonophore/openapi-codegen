## 1. Module

- [x] 1.1 Add `src/core/follow/lookupAndFollow.ts`
- [x] 1.2 Unit tests: no `$ref` keeps parent; `$ref` uses get + Follow parent; empty Canonical Ref source file falls back

## 2. Parsers

- [x] 2.1 v2/v3 `getOperationParameters`, `getOperationResponses`, `getServices` call `lookupAndFollow`
- [x] 2.2 v3 `getOperation` requestBody calls `lookupAndFollow`
- [x] 2.3 Existing Follow fixture still passes

## 3. ADR

- [x] 3.1 `docs/adr/0004-follow-lookup-module.md`
