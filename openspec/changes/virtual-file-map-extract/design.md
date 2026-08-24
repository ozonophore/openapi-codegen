## Context

`Context` — god-объект с тремя ролями за одним интерфейсом: $ref-поиск (прокси к SwaggerParser `$Refs`), маппинг выходных путей (`resolveCanonicalRef`, `getVirtualFiles`, `getAllCanonicalRefs`) и конфигурация генерации (`output`, `prefix`, `sortByRequired`, `root`, `plugins`). Маппинг выходных путей используется только двумя файлами (`getType.ts` v2 + v3). Остальные 14+ производственных вызывающих берут полный `Context`, хотя им нужны только refs + config.

Карта фактических вызывающих (не тесты):
- `resolveCanonicalRef` → только `getType.ts` (v2 + v3)
- `getVirtualFiles()` → **никто** (мёртвый публичный API)
- `getAllCanonicalRefs()` → `getModels.ts` (v2+v3), `reuseHelpers.ts`, `validateOpenApiStrict.ts` — всегда вместе с `context.get()`

Шов: `initializeVirtualFileMap()` строится из `_refs.paths()` + `refLookup`, которые уже есть в `attachResolvedOpenApi`. VirtualFileMap можно строить отдельно, получив `refs` и `refLookup` как аргументы.

## Goals / Non-Goals

**Goals:**
- Выделить `VirtualFileMap` как самостоятельный модуль в `src/core/specLoad/`
- Убрать `resolveCanonicalRef` и мёртвый `getVirtualFiles()` с `Context`
- `createResolvedContext` возвращает `{ context, map: VirtualFileMap, openApi }` — `getType.ts` берёт только `map`
- `Context.output` и `Context.getAllCanonicalRefs()` остаются (делегируют на `_map`)
- Поведение всех существующих тестов — не меняется

**Non-Goals:**
- Переработка v2/v3 Parser.ts или переменная Context в их сигнатурах
- Изменение семантики $ref-поиска, canonical refs, refLookup
- Рефакторинг `getModels.ts` и других файлов, использующих `context.get()` + `context.output` (они берут `context.output` через делегирующий геттер — ничего не меняют)
- Именованный тип `AbsolutePosixPath` или рефакторинг `resolveHelper`

## Decisions

### D1: Один `RefLookup` на `Context` и `VirtualFileMap`

`RefLookup` строится в `attachResolvedOpenApi` из `refs.paths()` + entryFile. `buildVirtualFileMap` принимает уже готовый `refLookup` как аргумент. Один экземпляр на оба объекта — никакого дублирования интернирования путей.

*Альтернатива*: VirtualFileMap строит свой RefLookup сам — отклонена: RefLookup интернирует пути по всему дереву, дублировать дорого и рискованно (рассинхронизация).

### D2: `context.output` — делегирующий геттер, не удаляется

`getModels.ts` (v2+v3) использует `context.output` вместе с `context.get()`. Переводить эти файлы на `(context, map)` — излишне: они не используют `resolveCanonicalRef`. Context сохраняет `get output() { return this._map.output }`.

*Альтернатива*: полное удаление `context.output` — отклонена: 4 вызывающих надо менять без выгоды.

### D3: `getAllCanonicalRefs()` остаётся на Context, делегирует на `map.getCanonicalRefs()`

Все три вызывающих используют `getAllCanonicalRefs()` вместе с `context.get()` — никогда по отдельности. Переход на `map.getCanonicalRefs()` потребует двух аргументов в их сигнатурах без выгоды.

### D4: `getVirtualFiles()` — удаляется

Ноль производственных вызывающих. Метод публичен случайно. Делегирующий геттер не нужен.

### D5: Расположение — `src/core/specLoad/VirtualFileMap.ts`

`VirtualFileMap` строится во время Spec load (`specLoad/forContext.ts`). Место рождения = место жительства. Экспортируется из `specLoad/index.ts` как `VirtualFileMap` и `buildVirtualFileMap`.

### D6: `createResolvedContext` — BREAKING изменение сигнатуры

Возвращает `{ context, map: VirtualFileMap, openApi }`. Существующий тип `{ context, openApi }` расширяется — у TypeScript это обратно совместимо при деструктуризации с `const { context, openApi }`, но вызывающие, которые берут `map`, должны явно его взять. `GenerationItemSession` обновляется — передаёт `map` в `getType.ts`.

## Risks / Trade-offs

`createResolvedContext` возвращает новое поле `map` — плагины или внешние вызывающие могут хранить тип `{ context: Context; openApi: CommonOpenApi }` явно → сборка сломается.
→ Митигация: в спецификации `context-resolved-factory` обновляется возвращаемый тип; изменение помечено как BREAKING в proposal.

`Context.output` делегирует на `this._map.output` — если `_map` не инициализирована (Context до `attachResolvedOpenApi`), геттер бросит.
→ Митигация: та же guard-логика, что у других геттеров (`if (!this._map) throw`).

`VirtualFileMap.resolve()` принимает `refLookup` как зависимость конструктора — если Context и VirtualFileMap рассинхронизируются по RefLookup, результаты lookup расходятся.
→ Митигация: один RefLookup строится в `attachResolvedOpenApi` и передаётся в `buildVirtualFileMap` — единый источник истины.
