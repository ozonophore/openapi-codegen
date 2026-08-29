## 1. Создать VirtualFileMap

- [x] 1.1 Создать `src/core/specLoad/VirtualFileMap.ts`: класс `VirtualFileMap` с полями `output: OutputPaths`, приватным `virtualFiles: Map`, приватным `canonicalRefs: Set`, приватным `refLookup: RefLookup`
- [x] 1.2 Реализовать `VirtualFileMap.resolve(canonicalRef, parentSourceFile?)` — переносит логику `Context.resolveCanonicalRef` (вызов `refLookup.toCanonicalRef` + поиск в `virtualFiles`)
- [x] 1.3 Реализовать `VirtualFileMap.getCanonicalRefs()` — возвращает `[...this.canonicalRefs]`
- [x] 1.4 Реализовать свободную функцию `buildVirtualFileMap(refs, refLookup, entryFile, output): VirtualFileMap` — переносит логику `Context.initializeVirtualFileMap` + `walkSchemaForFragments` + `mapSourceToOutput`
- [x] 1.5 Экспортировать `VirtualFileMap` и `buildVirtualFileMap` из `src/core/specLoad/index.ts`

## 2. Рефакторинг Context

- [x] 2.1 В `Context.attachResolvedOpenApi`: построить `refLookup`, вызвать `buildVirtualFileMap(refs, refLookup, absoluteEntryFile, this._output)`, сохранить в `this._map: VirtualFileMap`
- [x] 2.2 Удалить из Context: `initializeVirtualFileMap`, `walkSchemaForFragments`, `mapSourceToOutput`, `posixNormalizeSource`, `posixDirnameSource`, приватные поля `virtualFiles`, `canonicalRefs`, `specRoot`
- [x] 2.3 Удалить публичный метод `Context.resolveCanonicalRef`
- [x] 2.4 Удалить публичный метод `Context.getVirtualFiles`
- [x] 2.5 Заменить `Context.output` на делегирующий геттер: `get output() { if (!this._map) throw …; return this._map.output }`
- [x] 2.6 Заменить `Context.getAllCanonicalRefs()` на делегирующий метод: `return this._map.getCanonicalRefs()`

## 3. Обновить specLoad/forContext и createResolvedContext

- [x] 3.1 В `src/core/specLoad/forContext.ts` (`loadOpenApiForContext`): вызвать `context.attachResolvedOpenApi` (он уже строит `_map` внутри), затем вернуть `{ context, map: context.getMap(), openApi }` — или сделать `Context.map` публичным геттером
- [x] 3.2 Добавить на Context публичный геттер `get map(): VirtualFileMap` (guard + return `this._map`)
- [x] 3.3 Обновить возвращаемый тип `createResolvedContext`: `Promise<{ context: Context; map: VirtualFileMap; openApi: CommonOpenApi }>`
- [x] 3.4 Обновить `src/core/createResolvedContext.ts` — передать `map` в ответе из `loadOpenApiForContext`

## 4. Обновить вызывающих

- [x] 4.1 В `src/core/api/v2/parser/getType.ts`: заменить параметр `context: Context` на `map: VirtualFileMap`; заменить `context.resolveCanonicalRef(...)` на `map.resolve(...)`; заменить `context.output` на `map.output`
- [x] 4.2 В `src/core/api/v3/parser/getType.ts`: то же самое
- [x] 4.3 В `src/core/api/v2/Parser.ts` и `v3/Parser.ts`: найти вызовы `getType`, добавить передачу `map` (взять из аргументов Parser или из context — решение: Parser получает `map` из конструктора или аргумента)
- [x] 4.4 В `src/core/GenerationItemSession.ts`: деструктурировать `map` из результата `createResolvedContext`, передать в Parser

## 5. Тесты

- [x] 5.1 Обновить тесты `Context` — убрать проверки `resolveCanonicalRef`, `getVirtualFiles`; добавить проверки делегирующих `output` и `getAllCanonicalRefs`
- [x] 5.2 Написать unit-тест для `buildVirtualFileMap` + `VirtualFileMap.resolve` (изолированно от Context)
- [x] 5.3 Обновить тесты `getType.ts` (v2+v3) — передавать `VirtualFileMap` вместо `Context`
- [x] 5.4 Обновить тесты `createResolvedContext` / `forContext` — проверять наличие `map` в результате
- [x] 5.5 Запустить полный suite, убедиться что все тесты зелёные
