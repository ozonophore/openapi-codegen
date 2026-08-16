## 1. Воспроизвести Nested.ts

- [x] 1.1 Запустить `generate()` на `v3.withDifferentRefs` (лог Windows CI или симуляция intern-ключа). Подтвердить, что `generate()` завершается и `Nested.ts` из `#/properties/…` отсутствует в сгенерированном дереве. Не считать это шумом CRLF-снимков
- [x] 1.2 Зафиксировать причину: (1) Output mapping — POSIX `specRoot` vs ключ парсера с `\`, `relativeHelper` кладёт `.ts` вне сгенерированного каталога; или (2) не Output mapping — неверная идентичность / фильтр модели, поэтому `INested` никогда не эмитится. Отметить, является ли semantic-diff +1 breaking на той же фикстуре тем же промахом

## 2. Общий helper intern-ключа

- [x] 2.1 Добавить `src/core/utils/parserKeyMatch.ts` (свёртка слешей, percent-encoding, регистр буквы диска). Только intern-совпадение ключей; без `path.resolve`
- [x] 2.2 Юнит-тесты: `\ ` vs `/`, регистр буквы диска, `%20`, разный basename — не совпадение
- [x] 2.3 Направить intern-сравнение `RefLookup` на helper; URI-склейку и контракт родителя оставить в `RefLookup`. Существующие intern-кейсы `refLookup.test.ts` MUST по-прежнему проходить

## 3. Intern-совпадение в semantic expand

- [x] 3.1 `expandOpenApiRefsForSemanticDiff` intern-совпадает с ключами резолвера через общий helper. В `get` / `exists` уходят intern-точные ключи парсера. При необходимости отдать `paths()` (или эквивалент) на шве резолвера
- [x] 3.2 Expand MUST NOT импортировать класс `RefLookup`; сохранить свой конвейер `$ref`
- [x] 3.3 Тесты: intern-эквивалентные ключи разворачивают `./schemas/User.yaml` и `./schemas/common.yaml#/…`; неразрешённые `$ref` остаются объектами `$ref`

## 4. Фикс Nested.ts (один исход)

- [x] 4.1 Если исход (1): выровнять intern source file с `specRoot` до `relativeHelper`, чтобы Output mapping писал под `outputModels`. Не `$ref` lookup; не Remote `$ref`
- [x] 4.2 Если исход (2): починить идентичность / фильтр модели, чтобы `#/properties/…` оставались Models (`INested`, `TProp`). Не патчить Output mapping взамен
- [x] 4.3 Гейт: после `generate()` на `v3.withDifferentRefs` в сгенерированном дереве есть `Nested.ts` / `Prop.ts`; индекс экспортирует `INested` / `TProp`. Semantic-diff на той же фикстуре MUST NOT ложно давать +1 breaking из-за intern-промаха expand

## 5. Проверка

- [x] 5.1 Сьюты expand + RefLookup + `generate`/`getModels` на `v3.withDifferentRefs` проходят. Нет импорта `RefLookup` из specLoad expand (knip / grep)
- [x] 5.2 Не добавлять новые термины в `CONTEXT.md`. Не трогать скоуп `windows-disk-path-contract` (проверки pathHelpers, EBUSY rmdir, mkdir корня диска, путь git HEAD, toMatchSnapshot CRLF, EntitySkip / ProjectProbe / analyzeUsage / isSubDirectory / проверки слешей generation-cache)
- [x] 5.3 `openspec validate windows-output-and-semantic-refs`

## 6. Leftover: склейка без изобретённого диска

- [x] 6.1 В expand заменить `resolveHelper` на local slash-join (`path.posix` после свёртки слешей). Не `path.resolve`, не `pathToFileURL`, intern не расширять
- [x] 6.2 `isUrlLike` MUST NOT считать букву диска (`D:`) схемой URL — иначе склейка на Windows не выполняется
- [x] 6.3 Юнит-тесты expand (`/tmp` + intern `\tmp\...` + parent `D:/…`) проходят на Windows
- [ ] 6.4 Gate: оба снапшота `v3.withDifferentRefs` на Windows CI без ложного +1 breaking. Если +1 остаётся — не архивировать, не расширять intern
