## 1. LoadedSpec тип

- [x] 1.1 В `src/core/createResolvedContext.ts` добавить `export type LoadedSpec = { context: Context; map: VirtualFileMap; openApi: CommonOpenApi }`

## 2. Создать src/core/itemRun/

- [x] 2.1 Создать `src/core/itemRun/resolveEntitySkip.ts`: функция `resolveEntitySkip(item, absoluteInput, generationCache, reuseStore, specInput, optionsSlice)` — переносит EntitySkip-логику из `run()`, возвращает `{ skipped: true; files: string[]; cacheDebug: boolean; input: string } | { skipped: false }`
- [x] 2.2 Создать `src/core/itemRun/loadItemPlugins.ts`: функция `loadItemPlugins(plugins, disableBuiltinPlugins): Promise<OpenApiGeneratorPlugin[]>` — обёртка над `loadGeneratorPlugins(mergePluginPaths(...))`
- [x] 2.3 Создать `src/core/itemRun/loadItemSpec.ts`: функция `loadItemSpec(absoluteInput, outputPaths, item, plugins): Promise<LoadedSpec>` — маппинг аргументов из `item` + вызов `createResolvedContext`
- [x] 2.4 Создать `src/core/itemRun/parseAndPrepareClient.ts`: функция `parseAndPrepareClient(spec: LoadedSpec, item: ParseItemParams, prepareClient: PrepareClientFn, logger): Client` — V2/V3 switch + вызов `prepareClient`; определить локальные типы `ParseItemParams` и `PrepareClientFn`
- [x] 2.5 Создать `src/core/itemRun/buildReuseProps.ts`: функция `buildReuseProps(item, itemRunContext, modelSchemas, absoluteInput, specInput, optionsSlice): ReuseProps | undefined` — сборка `reuse`-объекта из D5
- [x] 2.6 Создать `src/core/itemRun/index.ts` — barrel-экспорт всех 5 функций и типов

## 3. Рефакторинг GenerationItemSession

- [x] 3.1 В `GenerationItemSession.run()`: заменить блок EntitySkip на вызов `resolveEntitySkip`, применить side effects из результата (`registerOutputFile`, логгер) в GIS
- [x] 3.2 Заменить `loadGeneratorPlugins(mergePluginPaths(...))` на вызов `loadItemPlugins`
- [x] 3.3 Заменить `createResolvedContext({...})` на вызов `loadItemSpec`
- [x] 3.4 Заменить V2/V3 switch + `prepareClientFromOpenApi` на вызов `parseAndPrepareClient`, передать `this.prepareClientFromOpenApi.bind(this)` как коллбэк
- [x] 3.5 Заменить сборку `reuse`-объекта на вызов `buildReuseProps`
- [x] 3.6 Убедиться, что `run()` ≤ 30 строк тела, компилируется без ошибок

## 4. Тесты

- [x] 4.1 Создать `src/core/itemRun/__tests__/resolveEntitySkip.test.ts` — unit-тесты: skip срабатывает при cache hit, не срабатывает при cache miss, возвращает правильные files
- [x] 4.2 Создать `src/core/itemRun/__tests__/loadItemPlugins.test.ts` — unit-тест: возвращает массив плагинов, disableBuiltins влияет на результат
- [x] 4.3 Создать `src/core/itemRun/__tests__/buildReuseProps.test.ts` — unit-тесты: возвращает undefined при `useReuseStore=false`, собирает корректный объект при `reuseStore` present
- [x] 4.4 Создать `src/core/itemRun/__tests__/parseAndPrepareClient.test.ts` — unit-тест: передаёт правильный Parser в prepareClient для V2 и V3
- [x] 4.5 Запустить полный suite, убедиться что все тесты зелёные
