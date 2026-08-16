## Why

На Windows CI два шва, которые уже используют общую орфографию intern-ключа, всё ещё промахиваются по ключам парсера `$Refs`: semantic expand оставляет `./schemas/User.yaml` и `./schemas/common.yaml#/…` неразвёрнутыми, а `generate()` на `v3.withDifferentRefs` может завершиться, не записав `Nested.ts` из `#/properties/…`. Юнит-тесты RefLookup проходят; оставшиеся баги — intern-совпадение ключей в expand и Output mapping (или идентичность модели) после lookup.

## What Changes

- Вынести сравнение ключей парсера (свёртка слешей, percent-encoding, регистр буквы диска) в маленький общий модуль, например `src/core/utils/parserKeyMatch.ts`. Его вызывают и `RefLookup`, и `expandOpenApiRefsForSemanticDiff`. Это intern-совпадение ключей, не `path.resolve`.
- Semantic-diff сохраняет **свой** конвейер expand `$ref`. **Не** импортировать класс `RefLookup` в expand / semantic-diff.
- Сделать так, чтобы expand intern-совпадал с ключами резолвера: пути, склеенные на Windows, попадают в intern-орфографию парсера (`User.yaml`, `common.yaml#/…`).
- Leftover: склейка expand — local slash-join, без `path.resolve` (не изобретать диск). `isUrlLike` только `http` / `https` / `file`. Intern не расширять. Gate: оба снапшота `v3.withDifferentRefs` на Windows CI.
- Расследовать отсутствие `Nested.ts` после `generate()` на `v3.withDifferentRefs` (`generate()` завершился; файла нет; это не шум CRLF-снимков). Подтвердить причину до фикса Output mapping или идентичности. Semantic-diff +1 breaking на той же фикстуре — тот же поток расследования.
- **Не** добавлять новые термины в `CONTEXT.md`. Использовать существующие термины: Tree `$ref`, Parent source file, Pointer, Canonical Ref, `$ref` lookup, Output mapping, Remote `$ref`.
- Вне скоупа (другой change `windows-disk-path-contract`): проверки тестов pathHelpers, EBUSY rmdir, mkdir корня диска, путь git HEAD, toMatchSnapshot CRLF, EntitySkip / ProjectProbe / analyzeUsage / isSubDirectory / проверки слешей generation-cache.

## Capabilities

### New Capabilities

- `parser-key-match`: общее intern-сравнение ключей парсера `$Refs` (свёртка слешей, percent-encoding, регистр буквы диска). Вызовы: `RefLookup` и semantic expand. Не `path.resolve` файловой системы.

### Modified Capabilities

- `spec-load-unify`: semantic expand MUST intern-совпадать с ключами резолвера; MUST сохранять свой конвейер expand и MUST NOT импортировать `RefLookup`.
- `openapi-spec-parsing`: Output mapping MUST отображать intern-ключи парсера (включая `\`) относительно POSIX `specRoot`, чтобы Models из `#/properties` вроде `Nested.ts` записывались; если причина не в этом, идентичность / фильтр модели MUST всё равно эмитить эти Models.

## Impact

- `src/core/utils/parserKeyMatch.ts` (новый) + извлечение `RefLookup.internKey`
- `src/core/specLoad/expandOpenApiRefsForSemanticDiff.ts` (intern-совпадение кандидатов с ключами резолвера; без импорта `RefLookup`)
- Context Output mapping (`specRoot`, `relativeHelper`, Virtual file map) и/или фильтр идентичности модели — только после воспроизведения
- Тесты: юнит-тесты parser-key-match; случаи intern-ключа expand на Windows (`./schemas/User.yaml`, `./schemas/common.yaml#/…`); гейт `generate()` на `v3.withDifferentRefs` для `Nested.ts` / `INested` (не CRLF)
- Нет **BREAKING** публичного package API. Нет правок `CONTEXT.md`. Сестринский change `windows-disk-path-contract` не трогаем.
