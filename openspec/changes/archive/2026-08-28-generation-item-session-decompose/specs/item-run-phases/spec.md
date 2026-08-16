## ADDED Requirements

### Requirement: Item-run phase modules
Система ДОЛЖНА предоставлять набор free functions в `src/core/itemRun/`, каждая инкапсулирующая одну фазу lifecycle generation item. Каждая функция ДОЛЖНА принимать только необходимые аргументы и возвращать чистый результат без IO-side effects (кроме явно задокументированных).

#### Scenario: resolveEntitySkip returns skip result without side effects
- **WHEN** вызывается `resolveEntitySkip(item, absoluteInput, generationCache, reuseStore, specInput, optionsSlice)`
- **THEN** возвращается `{ skipped: true; files: string[]; cacheDebug: boolean; input: string }` если EntitySkip срабатывает, либо `{ skipped: false }` иначе — без вызовов `writeClient` или логгера внутри функции

#### Scenario: loadItemPlugins returns loaded plugins
- **WHEN** вызывается `loadItemPlugins(plugins, disableBuiltinPlugins)`
- **THEN** возвращается `Promise<OpenApiGeneratorPlugin[]>` с загруженными и смерженными плагинами

#### Scenario: loadItemSpec wraps createResolvedContext
- **WHEN** вызывается `loadItemSpec(absoluteInput, outputPaths, item, plugins)`
- **THEN** возвращается `Promise<LoadedSpec>` — `{ context, map, openApi }` готовый для парсеров

#### Scenario: parseAndPrepareClient handles V2/V3 switch
- **WHEN** вызывается `parseAndPrepareClient(spec, item, prepareClient, logger)`
- **THEN** определяет версию OpenAPI из `spec.openApi`, создаёт нужный Parser, вызывает `prepareClient` и возвращает готовый `Client`

#### Scenario: buildReuseProps returns undefined when reuse disabled
- **WHEN** вызывается `buildReuseProps(...)` и `useReuseStore` false или `reuseStore` null
- **THEN** возвращается `undefined`

#### Scenario: buildReuseProps assembles props when reuse enabled
- **WHEN** вызывается `buildReuseProps(...)` и `reuseStore` присутствует
- **THEN** возвращается объект с полями `reuseStore`, `optionsSlice`, `specInput`, `inputPath`, `modelSchemas`, `referencedArtifactKeys`, `onReuseStat`, `reuseOnConflict`, `prettierConfigPath`, `sharedFolderWriter`

### Requirement: LoadedSpec type
`createResolvedContext.ts` ДОЛЖЕН экспортировать `LoadedSpec` — именованный тип для `{ context: Context; map: VirtualFileMap; openApi: CommonOpenApi }`.

#### Scenario: LoadedSpec exported from createResolvedContext
- **WHEN** код импортирует `LoadedSpec` из `src/core/createResolvedContext`
- **THEN** тип доступен и совпадает с возвращаемым значением `createResolvedContext`

### Requirement: GenerationItemSession thin orchestrator
`GenerationItemSession.run()` ДОЛЖЕН делегировать фазы free functions из `src/core/itemRun/` и содержать не более 30 строк тела метода. Публичная сигнатура `run(item, generationCache, itemRunContext)` ДОЛЖНА остаться неизменной.

#### Scenario: GIS.run applies side effects from resolveEntitySkip result
- **WHEN** `resolveEntitySkip` возвращает `{ skipped: true, files, cacheDebug, input }`
- **THEN** GIS вызывает `writeClient.registerOutputFile(filePath)` для каждого файла, логгирует CACHE_HIT если `cacheDebug`, возвращает `{ entitySkipped: true }`

#### Scenario: GIS.run delegates parse phase
- **WHEN** EntitySkip не сработал
- **THEN** GIS вызывает `loadItemPlugins`, `loadItemSpec`, `parseAndPrepareClient`, `buildReuseProps` последовательно и передаёт результаты в `writeClient.writeClient`
