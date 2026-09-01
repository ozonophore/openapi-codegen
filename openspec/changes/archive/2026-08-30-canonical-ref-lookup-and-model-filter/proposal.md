## Why

После `SwaggerParser.resolve()` файлы уже лежат в `$Refs`, но lookup всё ещё склеивал Tree `$ref` через `path.resolve` / `PathApi` и отдавал path API строки вида `file#/Pointer`. На darwin путь `C:/...` считался относительным; Pointer превращался в `#\Foo`. Параллельно `getModels` и `buildModelSchemaMap` брали **все** Canonical Refs, поэтому одноимённые requestBodies / responses / parameters становились пустыми Models (`SimpleRequestBody`, `ErrorResponse` без schema). Решение по join: `docs/adr/0001-ref-lookup-uri-and-parser-keys.md`.

## What Changes

- Один хозяин перевода (Parent source file, Tree `$ref`) → Canonical Ref: `RefLookup` (`src/core/utils/refLookup.ts`). Склейка — `new URL` против вручную собранного `file://`, не `path.resolve`. Intern-таблица по `refs.paths()`: совпадение только орфографии того же открытого файла (слеши, `%20`, регистр буквы диска). Нет файла в таблице → ссылки нет; не угадывать другой `Pet.yaml`, не искать на диске.
- `splitCanonicalRef` / `joinCanonicalRef` **до** любого path API. Pointer никогда не попадает в `path.join` / `normalize` / `resolve`. Parent source file — абсолютный путь без `#`; относительный файловый `$ref` без родителя — ошибка контракта; pointer-only без родителя → Entry file.
- Context.`get` / `exists` / обход Pointers только делегируют в тот же перевод. `PathApi`, `normalizeRef`, `parseRef`, `resolveRefPath`, `createNormalizedRef` удаляются. `pathHelpers` остаются для CLI и записи `.ts`.
- **BREAKING (generated output):** Model — только Canonical Ref, чей Pointer не в denylist non-schema registries (OAS3 components кроме schemas; OAS2 responses / parameters / securityDefinitions). Идентичность целого файла и `#/properties` / `#/items` / `#/allOf` остаются Models. `getModels` (v2/v3) и `buildModelSchemaMap` пропускают denylist; `stripNamespace` по-прежнему срезает префиксы реестров только для имён.
- Конвейер semantic diff не трогаем. UNC `\\server\share` вне скоупа.

## Capabilities

### New Capabilities

- `canonical-ref-lookup`: URI-склейка + intern ключей парсера; разрез Canonical Ref до path API; Context get/exists только делегируют.
- `schema-registry-model-filter`: denylist non-schema Pointers, чтобы `getModels` и reuse schema map отдавали только Schema Object.

### Modified Capabilities

- `document-service-baseline/openapi-spec-parsing`: «Context ref resolution» больше не `path.normalize` относительно parent; lookup MUST идти через Canonical Ref = ключ `$Refs`. Models MUST не строиться из non-schema component registries.

## Impact

- `src/core/utils/refLookup.ts`, `canonicalRef.ts` (split/join/isModelPointer); Context attach + get/exists + обход virtual map
- v2/v3 Parser: `get` / `toCanonicalRef` с Parent source file; `getModels` пропускает denylist; `getType` / operations через `toParentSourceFile`
- `reuseHelpers.buildModelSchemaMap` — тот же denylist
- `stripNamespace` — только именование (префиксы schema и non-schema)
- Тесты: `refLookup.test.ts`, `canonicalRef.isModel.test.ts`, `Context.canonicalRefLookup.test.ts`, `getModels.schemaRegistry.test.ts`; из снимков убрать `SimpleRequestBody` / `LomApi` / `V3WithAlias` как Models
- `CONTEXT.md` (Language); ADR `docs/adr/0001-ref-lookup-uri-and-parser-keys.md`
- Нет **BREAKING** публичного package API; **BREAKING** состав generated models (non-schema registries больше не дают `.ts`)
