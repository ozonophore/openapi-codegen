## ADDED Requirements

### Requirement: TrafficSplitter реализует четыре стратегии маршрутизации
Класс `TrafficSplitter` ДОЛЖЕН принимать `TrafficSplitterConfig` и реализовывать метод `routeRequest({ clientId })`, возвращающий `TrafficSplittingResult` с полем `isNewClient: boolean`. ДОЛЖНЫ поддерживаться стратегии `"weighted"`, `"round-robin"`, `"header-based"`, `"header-and-weighted"`.

#### Scenario: weighted стратегия маршрутизирует по весам
- **WHEN** `strategy: "weighted"`, `newClientWeight: 10`, `clientId: "user-1"`
- **THEN** `routeRequest` детерминированно возвращает `isNewClient` на основе `hash(clientId) % 100 < newClientWeight`

#### Scenario: round-robin чередует клиентов
- **WHEN** `strategy: "round-robin"` и последовательно вызвано `routeRequest` 4 раза
- **THEN** результаты чередуются: `false, true, false, true`

#### Scenario: header-based маршрутизирует по значению заголовка
- **WHEN** `strategy: "header-based"`, `headerName: "X-Version"`, `headerValues: { old: "v1", new: "v2" }`, передан `headers: { "X-Version": "v2" }`
- **THEN** `isNewClient === true`

#### Scenario: header-and-weighted использует заголовок как primary, weight как fallback
- **WHEN** `strategy: "header-and-weighted"` и заголовок не передан
- **THEN** маршрутизация выполняется по весам

---

### Requirement: TrafficSplitter поддерживает sticky sessions с TTL
При `stickySessions: true` ДОЛЖЕН поддерживаться детерминированный роутинг per-clientId с TTL из `sessionDuration` (строка формата `"1h"`, `"30m"`, `"2d"`). По истечении TTL сессия сбрасывается, маршрут пересчитывается.

#### Scenario: sticky session сохраняет маршрут в течение TTL
- **WHEN** `stickySessions: true`, `sessionDuration: "1h"`, один и тот же `clientId` вызван дважды подряд
- **THEN** оба вызова возвращают одинаковый `isNewClient`

#### Scenario: истёкшая сессия пересчитывается
- **WHEN** TTL истёк
- **THEN** следующий вызов с тем же `clientId` не гарантированно возвращает тот же результат (сессия пересоздаётся)

---

### Requirement: generateTrafficSplitterModule генерирует автономный TypeScript-модуль
Функция `generateTrafficSplitterModule(config, outputPath)` ДОЛЖНА записать в `outputPath/TrafficSplitter.ts` самодостаточный TypeScript-файл без внешних зависимостей. Файл ДОЛЖЕН содержать все типы inline и класс `TrafficSplitter` с той же публичной API.

#### Scenario: сгенерированный файл не имеет import-зависимостей
- **WHEN** `generateTrafficSplitterModule` выполнена
- **THEN** файл `TrafficSplitter.ts` не содержит ни одной строки `import`

#### Scenario: файл генерируется только при enabled: true
- **WHEN** `trafficSplitter.enabled === false` или опция отсутствует
- **THEN** файл `TrafficSplitter.ts` не создаётся

---

### Requirement: trafficSplitter выполняется как постгенерационный шаг в OpenApiClient
После `combineAndWrite`, при `rawOptions.trafficSplitter?.enabled === true`, ДОЛЖНА вызываться `generateTrafficSplitterModule` с output-папкой первого item. При `items.length > 1` ДОЛЖНО логироваться предупреждение `"trafficSplitter не предназначен для multi-item конфигов"`, но генерация не прерывается.

#### Scenario: предупреждение при multi-item
- **WHEN** конфиг имеет `trafficSplitter: { enabled: true }` и `items` с 2+ элементами
- **THEN** в stdout появляется warn-сообщение о несовместимости с multi-item
