## MODIFIED Requirements

### Requirement: эффективный request конфиг ограничивает шаринг request-sensitive core
Генератор MUST вычислять эффективный `request` каждого item как после `resolveGenerationOptions` (`item.request ?? root.request`). Core-файлы, чьё содержимое зависит от custom request / executor / связанных флагов шаблона, MUST шариться только между items с одинаковым transport fingerprint. Fingerprint MUST включать как минимум: эффективный `request` (или generated-default), `customExecutorPath` (или отсутствие), `httpClient`, `useCancelableRequest`, и факт экспорта `requestRaw` custom request при его наличии.

#### Scenario: корневой request шарится между items
- **WHEN** задан корневой `request`, ни один item не переопределяет `request`, и auto-group shared core активен
- **THEN** `request.ts` (и другие request-sensitive файлы с идентичным содержимым) шарятся под `__shared__/core/` со stubs в каждом item

#### Scenario: per-item override request запрещает кросс-item шаринг request
- **WHEN** item A наследует корневой `request`, а item B задаёт другой `items[].request`
- **THEN** A и B НЕ ДОЛЖНЫ делить один canonical `request.ts`; каждый сохраняет корректный полный или group-local файл для своего эффективного request

#### Scenario: одинаковый per-item request всё ещё шарится
- **WHEN** два item задают один и тот же путь `request` (явно или через один и тот же root fallback)
- **THEN** они МОГУТ шарить `request.ts` под `__shared__/core/` при активном auto-group
