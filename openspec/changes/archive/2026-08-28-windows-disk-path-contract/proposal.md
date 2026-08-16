## Why

На Windows строки дисковых путей, которые сравнивают или сохраняют после `pathHelpers`, по-прежнему смешивают `\` (`path.sep`, нативный `path.join`) с `/`. Тесты с ожиданием через `path.join` падают, LCA в `OutputGroupResolver` конвертируется обратно в `\`, пути для Git `show` становятся `test\\spec\\v3.json`, сравнение снимков ломается на CRLF vs LF, а `rmSync` временных каталогов бросает `EBUSY`. Тесты успешной записи также делают mkdir/write в `/`, что на Windows является корнем диска.

## What Changes

- После `pathHelpers` (`joinHelper`, `resolveHelper`, `relativeHelper`, `normalizeHelper`, `dirNameHelper`) сравниваемые и сохраняемые строки дисковых путей используют `/`. Тесты проверяют через `joinHelper`, не через нативный `path.join`.
- LCA в `OutputGroupResolver` MUST NOT конвертироваться обратно в `path.sep` (`\`).
- Исправить расхождения строк дисковых путей в EntitySkip, ProjectProbe, analyzeUsage (Client / Import / Service / rename), `isSubDirectory` и в проверках листинга generation cache.
- Общий тестовый хелпер для Windows `rmSync` временных каталогов: повторная попытка, затем игнорировать `EBUSY`. Это не изменение production-генератора.
- Production MUST отказывать в mkdir/write корня диска (`/`, `D:\`, `C:\`). Тесты успешной записи используют настоящий временный каталог. Отдельные тесты ожидают понятную ошибку для `/` и `D:\`.
- Пути Git CLI MUST быть POSIX (`test/spec/v3.json`), не `test\\spec\\v3.json`.
- `toMatchSnapshot` нормализует и expected, и received к `\n` перед сравнением. Не менять EOL файлов генератора в этом изменении.
- НЕ редактировать `CONTEXT.md`. Без новых терминов глоссария. Строки дисковых путей — это не Tree `$ref` / `$ref` lookup.

**Вне скоупа:** RefLookup, отсутствующая модель Nested.ts, expandOpenApiRefs, снимки semantic-diff, PathApi (уже удалён).

## Capabilities

### New Capabilities

- `windows-disk-path-contract`: строки дисковых путей, нормализованные к слешу после `pathHelpers`; LCA остаётся `/`; отказ писать в корень диска; POSIX-пути Git CLI; сравнение снимков по `\n`; тестовый хелпер для `EBUSY`; `joinHelper` в проверках.

### Modified Capabilities

- `reuse-auto-group-core`: LCA в `OutputGroupResolver` MUST оставаться со `/`; MUST NOT конвертироваться обратно в `path.sep`.
- `entity-skip-fingerprint`: строки дисковых путей кэшированных файлов / выходных путей сравниваются и сохраняются со `/`.
- `generation-cache-and-reuse`: проверки листинга generation cache используют `joinHelper`.
- `auto-select-and-project-probe`: сравниваемые/сохраняемые строки дисковых путей в ProjectProbe используют `/`.
- `consumer-usage-analysis`: строки дисковых путей analyzeUsage Client / Import / Service / rename используют `/`.
- `spec-load-unify`: пути Git CLI `readSpecFromGit` MUST быть POSIX (`test/spec/v3.json`).

## Impact

- `src/common/utils/pathHelpers.ts` (контракт уже отдаёт `/`; места вызова и тесты MUST использовать эту форму)
- `src/core/reuseStore/OutputGroupResolver.ts` — убрать обратную конвертацию в `path.sep`
- EntitySkip, ProjectProbe, analyzeUsage (Client/Import/Service/rename), `isSubDirectory`, тесты листинга generation cache
- Production-сторожок mkdir/write для корня диска: `fileSystemHelpers`, `src/core/write/writeClientModels.ts`, `src/core/write/writeClientSchemas.ts`
- Тесты успешной записи: настоящий временный каталог; отдельные тесты ошибок для `/` и `D:\` (`src/core/write/__tests__/writeClientModels.test.ts`, `writeClientSchemas.test.ts`)
- Общий тестовый хелпер: повторная попытка `rmSync`, затем игнорировать `EBUSY`
- `src/cli/analyzeDiff/specParser.ts` — POSIX-путь Git
- `test/utils/toMatchSnapshot.ts` — нормализация EOL только при сравнении
- Без правок `CONTEXT.md`; без новых терминов глоссария; без работы по RefLookup / PathApi / снимкам semantic-diff
- Нет **BREAKING** публичного package API
