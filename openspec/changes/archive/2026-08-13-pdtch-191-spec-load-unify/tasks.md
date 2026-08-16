## 1. Package

- [x] 1.1 Создать `src/core/specLoad/` с shared resolve, refs interface, forContext, forSemantic, перенос expand
- [x] 1.2 Barrel `index.ts` (internal, used surface); thin facades в старых файлах; без shim expand
- [x] 1.3 Перенести/обновить expand tests

## 2. Wire

- [x] 2.1 `createResolvedContext` → forContext
- [x] 2.2 `loadSemanticOpenApiSpec` / `Object` → forSemantic
- [x] 2.3 Убрать дублирующий resolve prose из старых implementations

## 3. Docs / verify

- [x] 3.1 Сверить `CONTEXT.md`
- [x] 3.2 Unit tests + knip + `openspec validate pdtch-191-spec-load-unify`
