## Context

`$ref` lookup (`RefLookup`) уже intern-совпадает с ключами парсера `$Refs`: свёртка слешей, percent-encoding, регистр буквы диска. Semantic expand (`expandOpenApiRefsForSemanticDiff`) — нет. Он склеивает Tree `$ref` через `resolveHelper` / `normalizeHelper`, затем вызывает `refs.exists` / `refs.get` с этой точной строкой. На Windows CI склеенный путь не равен ключу парсера, поэтому `./schemas/User.yaml` и `./schemas/common.yaml#/…` остаются неразвёрнутыми.

Отдельно `generate()` на `v3.withDifferentRefs` может завершиться, пока `Nested.ts` из `#/properties/…` отсутствует в сгенерированном дереве. Юнит-тесты RefLookup проходят. `getModels` на darwin по-прежнему ожидает `INested` / `TProp`. Это не шум CRLF-снимков. Semantic-diff +1 breaking на той же фикстуре — тот же поток расследования (неразвёрнутый файловый `$ref` и/или отсутствующий Output mapping для этого Canonical Ref).

Термины: Tree `$ref`, Parent source file, Pointer, Canonical Ref, `$ref` lookup, Output mapping, Remote `$ref` (`CONTEXT.md`). Новых терминов нет. У `$ref` lookup оговорка: missing drive ≠ current drive.

## Goals / Non-Goals

**Goals:**

- Один helper intern-сравнения ключей, которым пользуются и `RefLookup`, и semantic expand.
- Expand сохраняет свой конвейер `$ref` и intern-совпадает с ключами резолвера, чтобы пути, склеенные на Windows, попадали в intern-эквивалентные ключи парсера.
- Воспроизвести отсутствие `Nested.ts` после `generate()` на `v3.withDifferentRefs`, подтвердить Output mapping vs идентичность, затем чинить только эту причину.
- Та же фикстура: semantic-diff MUST NOT сообщать ложный +1 breaking из-за неразвёрнутых intern-эквивалентных файловых `$ref`.

**Non-Goals:**

- Импорт `RefLookup` в expand / semantic-diff.
- Замена склейки expand на URI/`new URL` (это по-прежнему работа `$ref` lookup).
- Новые термины в `CONTEXT.md` (оговорка intern «missing drive ≠ current drive» уже стоит).
- UNC `\\server\share`.
- Сестринский change `windows-disk-path-contract`: проверки тестов pathHelpers, EBUSY rmdir, mkdir корня диска, путь git HEAD, toMatchSnapshot CRLF, EntitySkip / ProjectProbe / analyzeUsage / isSubDirectory / проверки слешей generation-cache.

## Decisions

1. **Общий модуль intern-ключа, не общий переводчик.** Вынести свёртку слешей, percent-encoding и регистр буквы диска в `src/core/utils/parserKeyMatch.ts` (имя может отличаться; оставить небольшим). `RefLookup` заменяет свой приватный `internKey` вызовом этого модуля. `expandOpenApiRefsForSemanticDiff` вызывает то же сравнение, когда сопоставляет склеенного кандидата с ключом резолвера. Это intern-совпадение ключей, **не** `path.resolve`.

   *Альтернатива:* импортировать `RefLookup` в expand, чтобы один класс владел intern + склейкой. Отвергнута: semantic-diff сохраняет свой конвейер expand; URI-склейка `$ref` lookup и контракт родителя MUST NOT утекать в expand.

   *Альтернатива:* дублировать intern-орфографию в expand. Отвергнута: две орфографии разъедутся (уже Windows-промах).

2. **Конвейер expand остаётся локальным; intern-совпадение — шаг lookup.** Expand по-прежнему разбирает Tree `$ref`, склеивает файловую часть **local slash-join** (свёртка слешей + `path.posix.dirname` / `join` / `normalize`, без `path.resolve` / `resolveHelper` / `pathToFileURL`) и обходит JSON Pointers. Склейка MUST NOT изобретать букву диска, которой не было у родителя. `isUrlLike` MUST быть только `http://` / `https://` / `file:` — буква диска (`D:`) не схема. После склейки он MUST intern-совпадать с ключами парсера до `get` / `exists`. `createSwaggerRefsResolver` MAY отдавать `refs.paths()` (или эквивалентные intern-точные ключи), чтобы expand мог выбрать intern-точную строку для `refs.get`. Expand MUST NOT импортировать класс `RefLookup`. Intern MUST NOT считать `D:/tmp/foo` и `/tmp/foo` одной орфографией.

   *Альтернатива:* intern-совпадение только внутри обёртки резолвера, чтобы expand оставался на точном совпадении строк. Отвергнута: proposal требует, чтобы expand сам вызывал общий модуль.

3. **`Nested.ts` — сначала воспроизвести; заложить оба исхода.** Первая задача реализации: запустить `generate()` на `v3.withDifferentRefs` (Windows или симуляция intern-ключа), подтвердить, что `generate()` завершается, и зафиксировать, отсутствует ли `Nested.ts` в сгенерированном дереве, записан ли он в другое место или никогда не эмитился. Не считать провалом CRLF-снимков.

   **Исход (1) — Output mapping.** `specRoot` нормализован в POSIX (`normalizeHelper` на каталоге Entry file), а ключи Virtual file map — intern-точные ключи парсера, которые могут содержать `\`. Тогда `relativeHelper(specRoot, sourceFile)` даёт относительный путь, который не под `outputModels` (путь, выглядящий абсолютным `/…` после свёртки слешей, экранированный `../`, или путь, которого glob не видит). `Nested.ts` отсутствует в сгенерированном каталоге, хотя `$ref` lookup и `getModels` прошли. Фикс: intern-свёртка или иное выравнивание intern source file с `specRoot` **до** `relativeHelper`, не считая Output mapping за `$ref` lookup.

   **Исход (2) — не баг Output mapping.** Output mapping попадает в нужный каталог, но идентичность модели или фильтр schema-registry отбрасывает Canonical Ref `#/properties/…` (неверный Pointer после `\` в сериализованном ref, ложноотрицательный denylist, или идентичность не той вложенной схемы). `INested` никогда не доходит до записи. Чинить идентичность/фильтр; не «чинить» `relativeHelper` взамен.

   Semantic-diff +1 breaking на этой фикстуре — тот же поток: intern-промах в expand и/или отсутствующая идентичность вложенной схемы. Закрывать подтверждённой причиной, не третьим несвязанным патчем.

4. **Без новых терминов в `CONTEXT.md`.** Использовать существующие термины Language. Intern-совпадение ключей — оговорка орфографии `$ref` lookup (слеши, encoding, регистр буквы диска; missing drive ≠ current drive), не новое имя глоссария.

5. **Разделение скоупа с `windows-disk-path-contract`.** Диск / pathHelpers / чистота CI из Non-Goals остаются в том change. Этот change трогает только intern-сравнение ключей, совпадение в semantic expand и расследование Output mapping или идентичности Nested.ts.

## Risks / Trade-offs

- **[Риск] Intern-совпадение без `paths()` не может восстановить точный ключ парсера для `refs.get`.** → Митигация: шов резолвера отдаёт intern-точные ключи (`paths()` или intern-таблица); в `get` по-прежнему уходит строка парсера, не ключ сравнения.
- **[Риск] Считать Nested.ts CRLF или багом RefLookup.** → Митигация: сначала воспроизвести; тесты RefLookup уже проходят; исходы дизайна (1) vs (2) взаимоисключающие для фикса Output mapping vs идентичности.
- **[Риск] Тихо слить expand в `RefLookup`.** → Митигация: явный пункт Non-Goals; ревью кода отвергает `import { RefLookup }` из specLoad expand.
- **[Компромисс] Expand склеивает local slash-join (`path.posix`), не URI.** → `path.resolve` изобретал текущий диск на `/tmp`; URI/`pathToFileURL` делает то же. Intern не расширяем. URI-склейка остаётся в `$ref` lookup.
- **[Компромисс] Исход (1) vs (2) неизвестен до воспроизведения.** → Первая задача — диагностика; в поставку идёт только один из двух фиксов.

## Migration Plan

Внутренний. Откат — вернуть в expand lookup по точному совпадению строк и прежние Output mapping / фильтр. Нет изменения публичного package API. Нет **BREAKING** generated-client сверх восстановления `Nested.ts`, который уже должен существовать.

## Open Questions

- Nested.ts на Windows CI: `generate()` завершается, `INested` / `TProp` уже в `index.ts` (не исход 2). Assertion `endsWith(path.sep + 'Nested.ts')` падал из‑за glob `/` — починен свёрткой слешей. Semantic-diff +1 breaking на той же фикстуре — склейка expand изобретала диск (`path.resolve`) и/или `isUrlLike` принимал `D:` за URL. Gate leftover 6.4: оба снапшота `v3.withDifferentRefs` на Windows CI. Если +1 останется — не архивировать, не расширять intern.
