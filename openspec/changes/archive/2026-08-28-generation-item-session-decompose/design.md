## Context

`GenerationItemSession.run()` — единственный публичный метод класса, 200 строк, 8 логических фаз в одном теле. Деструктурирует 25+ полей из `TStrictFlatOptions`. Фазы:

1. resolveOutputPaths + absoluteInput (2 вызова, inline)
2. EntitySkip — проверка кэша, ранний выход
3. loadPlugins — `loadGeneratorPlugins(mergePluginPaths(...))`
4. loadSpec — `createResolvedContext(...)` → `{ context, map, openApi }`
5. specAnalysis — `if (specAnalysis?.enabled) await runSpecAnalysis(...)`
6. strictOpenApiGate — `if (strictOpenapi) await runStrictOpenApiGate(...)`
7. parseAndPrepareClient — V2/V3 switch + `prepareClientFromOpenApi`
8. buildReuseProps + writeClient.writeClient + cacheSet

Zero unit-тестов для GIS; каждая фаза требует полного integration setup.

## Goals / Non-Goals

**Goals:**
- Вынести фазы 2–5, 7 в free functions в `src/core/itemRun/`
- Ввести тип `LoadedSpec` в `createResolvedContext.ts`
- `run()` становится thin orchestrator (~20 строк)
- Добавить unit-тесты для каждой новой free function

**Non-Goals:**
- Изменение публичной сигнатуры `GenerationItemSession.run()`
- Изменение `GenerationBatchSession`, `generateItem` injectable
- Рефакторинг `prepareClientFromOpenApi` (остаётся private method GIS)
- Вынесение specAnalysis / strictOpenApiGate / writeAndCache (логика уже снаружи, обёртки не дают прироста)
- Изменение поведения любой фазы

## Decisions

### D1: `resolveEntitySkip` возвращает данные, side effects в GIS

`resolveEntitySkip(item, absoluteInput, generationCache, reuseStore, specInput, optionsSlice)` возвращает `{ skipped: true; files: string[]; cacheDebug: boolean; input: string } | { skipped: false }`. GIS сам вызывает `writeClient.registerOutputFile` и логгирует CACHE_HIT — функция не принимает `writeClient`.

*Альтернатива*: передать `writeClient` в функцию — отклонена: функция становится нечистой, теряет тестируемость без WriteClient mock.

### D2: `loadItemPlugins` — тонкая обёртка над `loadGeneratorPlugins`

`loadItemPlugins(plugins, disableBuiltinPlugins): Promise<OpenApiGeneratorPlugin[]>` разделяет шаг загрузки плагинов от шага загрузки спецификации. Позволяет тестировать каждый шаг независимо.

*Альтернатива*: объединить с `loadItemSpec` — отклонена: смешивает IO-операции разной природы (npm imports vs файл).

### D3: `LoadedSpec` — именованный тип в `createResolvedContext.ts`

```ts
export type LoadedSpec = { context: Context; map: VirtualFileMap; openApi: CommonOpenApi };
```

`createResolvedContext` уже возвращает этот shape — `LoadedSpec` просто именует инвариант. `loadItemSpec` принимает аргументы из `item` и возвращает `LoadedSpec`.

### D4: `parseAndPrepareClient` — free function, получает `LoadedSpec`

```ts
parseAndPrepareClient(spec: LoadedSpec, item: ParseParams, logger): Client
```

Инкапсулирует V2/V3 switch + вызов `prepareClientFromOpenApi`. `prepareClientFromOpenApi` остаётся приватным методом GIS и передаётся через параметр-коллбэк, или `parseAndPrepareClient` переезжает в `itemRun/` и дублирует вызов `prepareClient*` — решение: `parseAndPrepareClient` экспортируется из `itemRun/`, принимает `prepareClient: (params) => Client` как аргумент, GIS передаёт `this.prepareClientFromOpenApi.bind(this)`.

*Альтернатива*: полный перенос `prepareClientFromOpenApi` в `itemRun/` — отклонена: сейчас Not-Goal.

### D5: `buildReuseProps` — чистая функция сборки данных

```ts
buildReuseProps(item, itemRunContext, modelSchemas, absoluteInput, specInput, optionsSlice, prettierConfigPath): ReuseProps | undefined
```

Не принимает `writeClient`. Возвращает готовый объект для `writeClient.writeClient({ reuse: ... })`. Тестируется на data fixtures без IO.

### D6: Расположение — `src/core/itemRun/`

Все 5 модулей + `index.ts` + `__tests__/` живут в `src/core/itemRun/`. GIS импортирует из `../itemRun`.

## Risks / Trade-offs

`parseAndPrepareClient` принимает `prepareClient` коллбэк — это усложняет сигнатуру. Если в будущем понадобится полный перенос `prepareClientFromOpenApi`, достаточно убрать коллбэк и перенести логику.

`loadItemSpec` — по сути тонкая обёртка над `createResolvedContext` с маппингом аргументов из `item`. Если `createResolvedContext` изменится, `loadItemSpec` нужно обновить — единственный вызывающий, риск минимален.
