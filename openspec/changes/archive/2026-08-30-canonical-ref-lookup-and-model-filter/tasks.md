## 1. Примитивы Canonical Ref

- [x] 1.1 `splitCanonicalRef` / `joinCanonicalRef` / `toParentSourceFile` в `canonicalRef.ts`; Pointer не передаётся в path API
- [x] 1.2 `NON_MODEL_POINTER_PREFIXES` + `isModelPointer` / `isModelCanonicalRef` (denylist, не allowlist schema-реестров)
- [x] 1.3 Удалить `PathApi`, `normalizeRef`, `parseRef`, `resolveRefPath`, `createNormalizedRef`, `normalizePath`

## 2. RefLookup

- [x] 2.1 Intern `RefLookup` из `refs.paths()` + Entry file; ключ сравнения — только орфография (`%20`, `\`, буква диска)
- [x] 2.2 URI-склейка через вручную собранный `file://` + `new URL`; удалённый `$ref` как в YAML; промах intern не переписывает basename
- [x] 2.3 Жёсткий родитель: абсолютный, без Pointer; относительный Tree `$ref` без родителя → `RefLookupError`; pointer-only без родителя → Entry file
- [x] 2.4 Юнит-тесты `refLookup.test.ts` (POSIX, `C:/` на любой ОС, intern с `\`, ошибки контракта)

## 3. Context

- [x] 3.1 Attach создаёт `RefLookup`; `get` / `exists` / обход virtual map / `toCanonicalRef` только делегируют
- [x] 3.2 `exists` = false для локального файла вне intern; сбор Canonical Refs по-прежнему перечисляет non-schema Pointers
- [x] 3.3 Тесты lookup в Context (`Context.canonicalRefLookup.test.ts`)

## 4. Шов родителя в Parser

- [x] 4.1 v2/v3 `Parser.getTypeNameByRef` и `getType` / operations / parameters / responses / services передают `toParentSourceFile` в `get` / `toCanonicalRef`
- [x] 4.2 Родитель вложенного разбора Response `$ref` — **source file** Canonical Ref, не Pointer

## 5. Фильтр Models по schema registry

- [x] 5.1 v2/v3 `getModels` пропускают Pointers из denylist
- [x] 5.2 `buildModelSchemaMap` пропускает тот же denylist; при коллизии имени — Schema Object
- [x] 5.3 Префиксы именования в `stripNamespace` включают schema **и** non-schema registries; это не идентичность
- [x] 5.4 Тесты: `canonicalRef.isModel.test.ts`, `getModels.schemaRegistry.test.ts` (OAS2/OAS3, только requestBody, `#/properties` остаются Models)

## 6. Снимки и документация

- [x] 6.1 Обновить generation-снимки: убрать non-schema «модели» `SimpleRequestBody` / LomApi / v3withAlias
- [x] 6.2 Language в `CONTEXT.md` + ADR `docs/adr/0001-ref-lookup-uri-and-parser-keys.md`

## 7. Проверка

- [x] 7.1 Юнит- и snapshot-сьюты для lookup, getModels, emptySchema, index-фикстур
- [x] 7.2 knip: нет хвостов PathApi / старых normalize-ref экспортов
- [x] 7.3 `openspec validate canonical-ref-lookup-and-model-filter`
