## Context

Lookup `$ref` после `SwaggerParser.resolve()` должен попадать в ключ `$Refs`, а не строить «свой POSIX-путь». Сейчас Context склеивает Tree `$ref` через `path.resolve` / `PathApi`, иногда после передачи `file#/Pointer` в path API. Тесты подставляли `path.win32` на macOS и скрывали баг: на darwin `C:/` — относительный путь. `getModels` считает Model’ом каждый Canonical Ref, поэтому одноимённые `components.requestBodies` / `responses` сталкиваются со Schema Object (`SimpleRequestBody`, пустой `ErrorResponse`).

Происхождение (перенести в `research/` этого change; не второй источник требований): `instruction-ref-resolve.md`, `report-1-context-path-handling.md`, `report-2-normalize-ref.md`, `report-3-ref-resolver-cross-os.md`. Решение: `docs/adr/0001-ref-lookup-uri-and-parser-keys.md`. Термины — `CONTEXT.md` (Language).

## Goals / Non-Goals

**Goals:** Tree `$ref` + Parent source file → Canonical Ref = ключ `$Refs`; Pointer никогда не входит в path API; Models только из schema-eligible Pointers; тот же фильтр в reuse schema map.

**Non-Goals:** конвейер expand для semantic diff; UNC `\\server\share`; «починка» имени файла / поиск на диске; плагины и расчёт output-пути; слияние lookup в Spec-load; смена семантики `dereference` vs `resolve`.

## Decisions

1. **Единственный переводчик — `RefLookup`.** Его вызывают Context.`toCanonicalRef` / `get` / `exists` и обход virtual map. Второго «канонического пути» нет. Intern-таблица собирается при attach из `refs.paths()` (+ Entry file). В `refs.get` уходит **точное** intern-значение, не ключ сравнения.

   Альтернатива: оставить `path.resolve` + `PathApi` — отвергнута (ADR): семантика ОС процесса; `C:/` на darwin относительный; Pointer утекает в `#\`.

2. **URI-склейка, не `path`.** Резать по первому `#`. Пустой файл → родитель (или Entry file) + Pointer. `http(s)` → строка как в YAML. Иначе вручную собрать базу `file:///` (`C:/` → `file:///C:/...` даже на darwin) и `new URL(treeFile, base)`. Не вызывать host `pathToFileURL` для `C:/`, если `process.platform !== 'win32'`.

3. **Сравнение в intern — только орфография.** `%20` → пробел, `\` → `/`, схлопнуть `//` кроме ведущего `//`, буква диска в верхний регистр. Нет ключа в intern → Canonical Ref остаётся склеенным путём; `exists` для локального файла вне intern — false; не переписывать на другой `Pet.yaml`.

4. **Контракт родителя жёсткий.** Parent MUST быть абсолютным и MUST NOT содержать `#`. Относительный файловый Tree `$ref` без родителя → `RefLookupError`. Pointer-only без родителя → Entry file. Вызовы, которые раньше передавали `file#/Pointer` как родителя, MUST сначала вызвать `toParentSourceFile` (Parser getType / operations / getTypeNameByRef). Lookup MUST NOT молча отрезать `#`.

5. **Идентичность Model = denylist по уже разрезанному Pointer.** `NON_MODEL_POINTER_PREFIXES`: OAS3 `components/{responses,parameters,headers,requestBodies,examples,securitySchemes,links,callbacks,pathItems}/`; OAS2 `#/responses/`, `#/parameters/`, `#/securityDefinitions/`. Пустой Pointer (целый файл) и schema-подобные Pointers (`#/components/schemas/`, `#/definitions/`, `#/properties`, `#/items`, `#/allOf`) остаются Models. `stripNamespace` по-прежнему срезает **и** schema, **и** non-schema префиксы **только для имён** — `Item` из requestBodies и из schemas это не идентичность.

   Альтернатива: allowlist только `#/components/schemas/` + `#/definitions/` — отвергнута: пропадут Models с целого файла и с `#/properties` (`v3.withDifferentRefs`).

6. **Фильтр на эмиссии Model, не на сборе Canonical Ref.** `getAllCanonicalRefs` по-прежнему перечисляет requestBodies и т.п. (strict / reuse / обход). `getModels` и `buildModelSchemaMap` пропускают denylist. При совпадении имени в reuse map побеждает Schema Object.

7. **Стек PathApi удалить.** `pathHelpers` остаются для CLI и записи `.ts`. Semantic expand сохраняет свой локальный `parseRef` / `normalizeRefFile`.

## Risks / Trade-offs

- **[Риск] Из generated output исчезнут бывшие «модели» из requestBodies/responses** → намеренный **BREAKING**; обновить снимки (`SimpleRequestBody`, LomApi, v3withAlias). Зафиксировать в changelog / release notes.
- **[Риск] Вызывающий передаёт `file#pointer` как родителя** → `RefLookupError`; точки Parser используют `toParentSourceFile`.
- **[Риск] Промах intern на необычных ключах парсера (UNC, варианты `file://`)** → строгий miss; UNC вне скоупа; тесты покрывают `%20`, обратный слеш, регистр буквы диска, `C:/` на любой ОС процесса.
- **[Компромисс] Denylist vs allowlist** → denylist сохраняет Models с `#/properties`; новый OAS-реестр потребует явного префикса.
- **[Компромисс] Research сейчас в корне репозитория** → перенести в `research/`, чтобы архив унёс его с change; ADR остаётся в `docs/adr/`.

## Migration Plan

Внутренний change. Откат — вернуть предыдущую реализацию lookup и эмиссии Models. Потребители сгенерированных клиентов: удалить импорты исчезнувших non-schema «моделей».

## Open Questions

_(нет — ADR фиксирует join / intern / denylist)_
