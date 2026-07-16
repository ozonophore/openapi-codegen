## 1. Пре-парсер: расширение MARAUDER_GROUP_KEYS

- [x] 1.1 Добавить `'workspace-report': 'workspaceReport'`, `'traffic-splitter': 'trafficSplitter'` и `'swarm': 'swarm'` в `MARAUDER_GROUP_KEYS` в `src/cli/utils/parseNestedCliOptions.ts`
- [x] 1.2 Добавить поля `workspaceReport`, `trafficSplitter` и `swarm` в тип `NestedMarauderOptions` в том же файле

## 2. Zod-хелперы схемы для block-флагов

- [x] 2.1 Добавить хелпер `workspaceReportConfigSchemaOrBoolean` в `src/common/VersionedSchema/CommonSchemas.ts` (или соседний файл), валидирующий `enabled?: boolean`, `path?: string`, `format?: 'json' | 'markdown' | 'both'`
- [x] 2.2 Добавить хелпер `trafficSplitterConfigSchemaOrBoolean`, валидирующий `enabled`, enum `strategy`, `oldClientWeight`, `newClientWeight`, `stickySessions`, `sessionDuration`, `headerName`, `headerValues`
- [x] 2.3 Добавить хелпер `swarmConfigSchemaOrBoolean`, валидирующий `enabled?: boolean`, `output?: string`

## 3. generateOptionsBaseSchema: новые поля

- [x] 3.1 Импортировать три новых хелпера схемы в `src/cli/schemas/generate.ts`
- [x] 3.2 Добавить `workspaceReport: workspaceReportConfigSchemaOrBoolean.optional()` в `generateOptionsBaseSchema`
- [x] 3.3 Добавить `trafficSplitter: trafficSplitterConfigSchemaOrBoolean.optional()` в `generateOptionsBaseSchema`
- [x] 3.4 Добавить `swarm: swarmConfigSchemaOrBoolean.optional()` в `generateOptionsBaseSchema`
- [x] 3.5 Добавить `preAnalyze: z.boolean().optional()` в `generateOptionsBaseSchema`
- [x] 3.6 Добавить `reuseMode: z.enum(['copy', 'auto-group']).optional()` в `generateOptionsBaseSchema`

## 4. Слой слияния: generateCliOverrides

- [x] 4.1 Добавить `'workspaceReport'`, `'trafficSplitter'` и `'swarm'` в множество `DIRECT_FLAT_CLI_EXCLUDE_KEYS` в `src/cli/generateOpenApiClient/generateCliOverrides.ts`
- [x] 4.2 Добавить `'preAnalyze'` и `'reuseMode'` в массив `GENERATE_CLI_OVERRIDE_KEYS` в том же файле
- [x] 4.3 Добавить `merged.workspaceReport = mergeMarauderBlockDeep(config.workspaceReport, cli.workspaceReport)` в `mergeGenerateCliOverrides`
- [x] 4.4 Добавить аналогичные строки слияния для `trafficSplitter` и `swarm`

## 5. Commander-опции для команды generate

- [x] 5.1 Добавить `.option('--workspace-report', 'Включить генерацию workspace-отчёта (workspaceReport). Поддерживает dot-notation: --workspace-report.format, --workspace-report.path')` в команду `generate` в `src/cli/index.ts`
- [x] 5.2 Добавить `.option('--traffic-splitter', 'Включить генерацию модуля traffic splitter. Поддерживает dot-notation: --traffic-splitter.strategy и др.')` в команду `generate`
- [x] 5.3 Добавить `.option('--swarm', 'Включить генерацию AvatarSwarm-манифеста. Поддерживает dot-notation: --swarm.output')` в команду `generate`
- [x] 5.4 Добавить `.option('--pre-analyze', 'Запустить cross-spec предгенерационный анализ до записи любых файлов')` в команду `generate`
- [x] 5.5 Добавить `.addOption(new Option('--reuse-mode <value>', 'Режим дедупликации reuse при cacheStrategy: reuse').choices(['copy', 'auto-group']))` в команду `generate`

## 6. Файл примера конфига

- [x] 6.1 Создать `example/openapi.marauder.config.json` с демонстрацией multi-spec монорепозитория: `workspaceReport` (объектная форма), `trafficSplitter` (объектная форма, weighted-стратегия), `swarm` (объектная форма), `preAnalyze: true`, `reuseMode: "auto-group"`, `cacheStrategy: "reuse"` и как минимум два items
- [x] 6.2 Убедиться, что `example/openapi.config.json` не изменён (побайтовое сравнение или ручная проверка)
