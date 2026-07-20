## 1. Общая подготовка: типы и defaults

- [x] 1.1 Добавить поля `workspaceReport`, `trafficSplitter`, `swarm`, `preAnalyze`, `reuseMode` в `TFlatOptions` в `src/common/VersionedSchema/AllVersionedSchemas/UnifiedVersionedSchemas.ts` (или через `flatOptionsSchema`) — если они ещё не попадают туда через `UnifiedOptionsSchemaV6`
- [x] 1.2 Добавить defaults для новых полей в `COMMON_DEFAULT_OPTIONS_VALUES` в `src/common/Consts.ts`: `workspaceReport: { enabled: false, ... }`, `trafficSplitter: { enabled: false }`, `swarm: { enabled: false, output: './swarm-manifest.json' }`, `preAnalyze: false`, `reuseMode: 'copy'`

## 2. workspaceReport

- [x] 2.1 Создать `src/core/workspaceReport/types.ts` с интерфейсами `WorkspaceReport`, `WorkspaceSpecSummary`, `WorkspaceReportConfig`
- [x] 2.2 Создать `src/core/workspaceReport/buildWorkspaceReport.ts`: функция `buildWorkspaceReport(specStats, reuseStore, config)` → `WorkspaceReport`
- [x] 2.3 Создать `src/core/workspaceReport/writeWorkspaceReport.ts`: функция `writeWorkspaceReport(report, config)` с поддержкой `format: 'json' | 'markdown' | 'both'`
- [x] 2.4 Подключить в `OpenApiClient.generateCodeForItems`: после `combineAndWrite` + `finalizeSpecAnalysis` добавить вызов `buildWorkspaceReport` + `writeWorkspaceReport` при `rawOptions.workspaceReport?.enabled`
- [x] 2.5 Экспортировать `buildWorkspaceReport`, `writeWorkspaceReport` и типы из `src/core/index.ts`

## 3. trafficSplitter

- [x] 3.1 Создать `src/core/migration/types.ts` с типами `TrafficSplitterConfig`, `TrafficSplittingResult`, `SessionStats`
- [x] 3.2 Создать `src/core/migration/TrafficSplitter.ts`: класс с 4 стратегиями, sticky sessions (Map + TTL), статистикой сессий
- [x] 3.3 Создать `src/core/migration/generateTrafficSplitterModule.ts`: функция `generateTrafficSplitterModule(config, outputPath)` — генерирует автономный `TrafficSplitter.ts` без внешних импортов
- [x] 3.4 Подключить в `OpenApiClient.generateCodeForItems`: после `combineAndWrite` вызвать `generateTrafficSplitterModule` при `rawOptions.trafficSplitter?.enabled`; логировать warn при `items.length > 1`
- [x] 3.5 Экспортировать `TrafficSplitter`, `generateTrafficSplitterModule` и типы из `src/core/index.ts`

## 4. AvatarSwarm

- [x] 4.1 Создать `src/core/avatarSwarm/types.ts` с типами `SwarmManifest`, `AvatarDescriptor`, `SwarmSharedModel`, `SwarmConfig`
- [x] 4.2 Создать `src/core/avatarSwarm/AvatarSwarmGenerator.ts`: класс `AvatarSwarmGenerator` с методом `build(items, reuseStore?)` → `SwarmManifest`; реализовать `operationIndex` с детерминированным разрешением коллизий; `sharedModels` из ReuseStore или fallback к пересечению имён
- [x] 4.3 Создать `src/core/avatarSwarm/writeSwarmOutput.ts`: функция `writeSwarmOutput(manifest, config)` → запись JSON
- [x] 4.4 Подключить в `OpenApiClient.generateCodeForItems`: после `combineAndWrite` вызвать `AvatarSwarmGenerator.build` + `writeSwarmOutput` при `rawOptions.swarm?.enabled`
- [x] 4.5 Экспортировать `AvatarSwarmGenerator` и типы из `src/core/index.ts`

## 5. preAnalyze

- [x] 5.1 Создать функцию `runPreAnalyze(items, logger)` в `src/core/specAnalysis/runPreAnalyze.ts`: парсит все спеки (V2/V3), собирает схемы моделей, запускает `CrossSpecAnalyzer`, выводит структурированный отчёт в stdout; ошибки парсинга отдельных спек — warn, не бросать
- [x] 5.2 Подключить в `OpenApiClient.generateCodeForItems`: вызвать `runPreAnalyze(items, logger)` **до** первого `generateSingle` при `rawOptions.preAnalyze === true`

## 6. reuseMode: auto-group

- [x] 6.1 Создать `src/core/reuseStore/OutputGroupResolver.ts`: функция `resolveOutputGroups(absoluteOutputPaths)` → `string | null` (LCA или null при тривиальном)
- [x] 6.2 Создать `src/core/reuseStore/computeStoreRelativeImport.ts`: функция `computeStoreRelativeImport(stubPath, canonicalPath)` → относительный путь для `export * from`
- [x] 6.3 Создать `src/core/reuseStore/SharedFolderWriter.ts`: класс/функции для записи canonical-файла в `{LCA}/__shared__/{kind}/{Name}.ts` и stub в `{item.output}/{kind}/{Name}.ts`
- [x] 6.4 Подключить `SharedFolderWriter` в `reuseWriterHelpers.ts`: при `reuseMode === 'auto-group'` и наличии LCA использовать `SharedFolderWriter` вместо прямой записи; при null-LCA — fallback с warn
- [x] 6.5 Проверить, что stub-файлы регистрируются в `WriteClient` как output-файлы (чтобы попасть в barrel-индексы)
- [x] 6.6 Добавить проверку совместимости: если `reuseMode === 'auto-group'` и `cacheStrategy !== 'reuse'` — warn + игнорировать `auto-group`
