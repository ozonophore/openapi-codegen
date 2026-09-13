# Follow после `$ref` lookup — модуль `lookupAndFollow`, не метод Context и не копия в парсерах

`sourceFileAfterRef` назвал математику Follow (source file Canonical Ref или родитель вызывающего). Парсеры всё равно обязаны сделать `get` + `toCanonicalRef` + helper; семь call site копировали этот танец, и parameters/requestBody его уже один раз потеряли. Модуль `lookupAndFollow(lookup, node, parent)` — единственный шов: Context передаётся как duck `{ get, toCanonicalRef }`, метод на Context не растёт. `sourceFileAfterRef` остаётся примитивом Canonical Ref в `canonicalRef.ts`.

## Considered Options

- **Helper-only (HEAD после `follow-after-ref`):** каждый парсер помнит три шага. Отклонено: Follow снова становится племенным знанием.
- **Метод Context:** прячет lookup, раздувает мешок. Отклонено.
- **`lookupAndFollow` в `src/core/follow/`:** один interface, тесты через него. Принято.

## Consequences

- Новый парсер, который делает `context.get` и оставляет parent вызывающего, нарушает spec-delta: MUST звать `lookupAndFollow`.
- Поведение generate не меняется.
