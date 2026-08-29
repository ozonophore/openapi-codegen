## Why

`Context` выполняет две несвязанные роли через один интерфейс: $ref-поиск (используется парсерами, strict, reuseStore) и маппинг выходных путей (используется только `getType.ts`). Вызывающие, которым нужен только маппинг путей, вынуждены тащить весь `Context` — с рефами, плагинами и конфигурацией. Результат: `getType.ts` нельзя протестировать без полной инициализации контекста, а `resolveCanonicalRef` невозможно найти без знания об обеих ролях.

## What Changes

- **НОВЫЙ МОДУЛЬ** `src/core/specLoad/VirtualFileMap.ts` — класс `VirtualFileMap` с интерфейсом: `resolve(canonicalRef, parent?) → { outputFile, fragment } | undefined`, `getCanonicalRefs() → string[]`, `output: OutputPaths`. Строится фабрикой `buildVirtualFileMap(refs, refLookup, entryFile, output)`.
- `Context.resolveCanonicalRef` — **удаляется**, метод переезжает на `VirtualFileMap.resolve()`
- `Context.getVirtualFiles()` — **удаляется** (0 производственных вызывающих)
- `Context.output` — остаётся как делегирующий геттер → `this._map.output`
- `Context.getAllCanonicalRefs()` — остаётся, делегирует → `this._map.getCanonicalRefs()`
- `Context.attachResolvedOpenApi` — строит `RefLookup` один раз, передаёт его в `buildVirtualFileMap`
- `createResolvedContext` — **BREAKING**: возвращает `{ context, map: VirtualFileMap, openApi }` вместо `{ context, openApi }`
- `src/core/api/v2/parser/getType.ts` и `v3` аналог — принимают `map: VirtualFileMap` вместо `context` (для `resolveCanonicalRef` и `output`)

## Capabilities

### New Capabilities

- `virtual-file-map`: Самостоятельный модуль маппинга выходных путей, строящийся при загрузке спецификации. Инкапсулирует построение карты источник-файл → output-файл, сбор canonical refs и разрешение ссылки в выходной путь.

### Modified Capabilities

- `context-resolved-factory`: `createResolvedContext` теперь возвращает `{ context, map: VirtualFileMap, openApi }` — добавляется `map` в результат; сигнатура `ForContextProps` не меняется.

## Impact

- `src/core/Context.ts` — удаление `resolveCanonicalRef`, `getVirtualFiles`; добавление делегирующих геттеров; рефакторинг `attachResolvedOpenApi`
- `src/core/specLoad/VirtualFileMap.ts` — новый файл
- `src/core/specLoad/forContext.ts` — строит и возвращает `VirtualFileMap`
- `src/core/createResolvedContext.ts` — обновление возвращаемого типа
- `src/core/api/v2/parser/getType.ts`, `src/core/api/v3/parser/getType.ts` — смена аргумента с `context` на `map`
- `src/core/GenerationItemSession.ts` — передаёт `map` в вызовы `getType`
- Тесты: `Context.test.ts`, `getType.test.ts` (v2+v3), `forContext.test.ts`
