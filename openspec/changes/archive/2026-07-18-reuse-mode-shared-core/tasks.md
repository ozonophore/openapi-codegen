## 1. Fingerprint и helper записи shared-core

- [x] 1.1 Добавить helper transport/core fingerprint (эффективный `request`, `customExecutorPath`, `httpClient`, `useCancelableRequest`, детект `requestRaw`) для использования после `normalizeOptions`
- [x] 1.2 Добавить helper записи shared-core: при наличии `SharedFolderWriter` + item `outputCore` + relative path + content пишет canonical `{LCA}/__shared__/core/{rel}` и stub через `computeStoreRelativeImport`; при конфликте content-hash → полный локальный файл + warn
- [x] 1.3 Unit-тесты равенства fingerprint для корневого `request` vs per-item override vs одинаковых override; unit-тесты путей stub для вложенного `executor/` и fallback при конфликте

## 2. Подключение writeClientCore / WriteClient

- [x] 2.1 Передавать `sharedFolderWriter` (если есть) в `writeClientCore` / путь записи core в `WriteClient.write`
- [x] 2.2 Направлять каждый core-output через shared-core helper при активном auto-group; оставлять полную локальную запись для содержимого, не входящего в share-set (напр. расходящийся `OpenAPI.ts`)
- [x] 2.3 Убедиться, что copy-пути custom `request` / `customExecutorPath` подчиняются тем же правилам share-or-local
- [x] 2.4 Проверить, что `writeClientCoreIndex` / barrel по-прежнему указывает на item-local имена файлов (stubs)

## 3. Интеграция OpenApiClient и предупреждения

- [x] 3.1 Гарантировать, что `generateSingle` / запись core получает тот же `sharedFolderWriter`, что уже используется для models при `reuseMode: "auto-group"`
- [x] 3.2 Обновить сообщения `warnOnSharedCoreServiceOutputs`, чтобы при активном auto-group они отражали shared-core (больше не «только models/schemas» в этом режиме)
- [x] 3.3 Добавить/скорректировать константы logger-сообщений для конфликта shared-core и опциональной share-сводки при необходимости

## 4. Тесты и документация

- [x] 4.1 Integration-тест: multi-item конфиг, корневой `request`, auto-group → shared `__shared__/core/ApiError.ts` (и request-sensitive файлы) + stubs в `core/` каждого item
- [x] 4.2 Integration-тест: один item переопределяет `request` → этот item не stub'ится на `request.ts` другого item
- [x] 4.3 Integration-тест: разные OpenAPI server → полный локальный `OpenAPI.ts` у каждого item
- [x] 4.4 Кратко обновить Marauder reuse docs (`docs/en/features.md` / `docs/ru/features.md` или MARAUDER guide): `__shared__/core` и правила request root vs item
- [x] 4.5 Прогнать целевые unit/integration тесты и `npm run build` для затронутых пакетов

## 5. ReuseStore: namespaced paths + schemaHash (smoke marauder)

- [x] 5.1 В `buildNamespacedModelArtifactRelativePath` / `buildNamespacedSchemaArtifactRelativePath` добавить сегмент `{schemaHash.slice(0, 8)}`, чтобы при `reuseOnConflict: "namespace"` один и тот же `specItem` + `optionsSliceHash` с разным schema не давали path collision в `assertPathAvailable`
- [x] 5.2 Передавать `hashSchema(schema)` из namespace-ветки `writeReusedArtifact` в builders
- [x] 5.3 Unit-тест: два schemaHash при одинаковых spec/options → разные relative paths
- [x] 5.4 Smoke: `npx tsx ./src/cli/index.ts generate -ocn ./example/openapi.marauder.config.json` завершается без `ReuseConflictError` по `EEnumWithNumbers` («v3» vs «v3»)
