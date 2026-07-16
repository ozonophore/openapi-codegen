## ADDED Requirements

### Requirement: AvatarSwarmGenerator собирает SwarmManifest из items и ReuseStore
Класс `AvatarSwarmGenerator` ДОЛЖЕН реализовывать метод `build(items, reuseStore?)`, возвращающий `SwarmManifest` с полями: `version: 1`, `generatedAt`, `avatars: AvatarDescriptor[]`, `sharedModels: SwarmSharedModel[]`, `operationIndex: Record<string, string>`. Каждый `AvatarDescriptor` ДОЛЖЕН соответствовать одному item конфига.

#### Scenario: avatars содержат данные из каждого item
- **WHEN** конфиг имеет 3 items
- **THEN** `manifest.avatars` содержит 3 элемента, каждый с корректными `specItem`, `input`, `output`

#### Scenario: reuseHits и reuseMisses берутся из specItems ReuseStore
- **WHEN** `reuseStore` доступен и содержит данные по specItem
- **THEN** соответствующий `AvatarDescriptor` имеет корректные `reuseHits` и `reuseMisses`

---

### Requirement: sharedModels определяются через ReuseStore или fallback к пересечению имён
При наличии `reuseStore` — `sharedModels` строятся из манифеста: артефакты с `referencedBy.length > 1`. При отсутствии `reuseStore` — пересечение имён моделей между specs (менее точно).

#### Scenario: sharedModels из ReuseStore точны
- **WHEN** `reuseStore` содержит артефакт, используемый двумя specs
- **THEN** этот артефакт присутствует в `manifest.sharedModels` с корректным `usedBy`

#### Scenario: fallback к пересечению имён при отсутствии ReuseStore
- **WHEN** `reuseStore === null`
- **THEN** `sharedModels` содержит модели с совпадающими именами между specs (без hash-верификации)

---

### Requirement: operationIndex строится из всех specItems, при коллизии побеждает первый
`operationIndex: Record<operationId, specItem>` ДОЛЖЕН включать все operationId из всех items. При коллизии (один operationId в двух specs) побеждает первый встреченный item (детерминированно по порядку items в конфиге).

#### Scenario: уникальные operationId попадают в индекс
- **WHEN** specs не имеют пересекающихся operationId
- **THEN** все operationId присутствуют в `operationIndex`

#### Scenario: коллизия operationId разрешается в пользу первого item
- **WHEN** два items содержат одинаковый `operationId: "getUser"`
- **THEN** `operationIndex["getUser"]` равен `specItem` первого item

---

### Requirement: writeSwarmOutput записывает swarm-manifest.json
Функция `writeSwarmOutput(manifest, config)` ДОЛЖНА записать `SwarmManifest` в JSON-файл по пути `config.output` (default: `"./swarm-manifest.json"`).

#### Scenario: файл создаётся в указанном пути
- **WHEN** `swarm.output === "./reports/swarm-manifest.json"` и генерация завершена
- **THEN** файл `./reports/swarm-manifest.json` создан и содержит валидный JSON

---

### Requirement: swarm выполняется как постгенерационный шаг в OpenApiClient
После `combineAndWrite`, при `rawOptions.swarm?.enabled === true`, ДОЛЖНЫ вызываться `AvatarSwarmGenerator.build` и `writeSwarmOutput`.

#### Scenario: swarm включён — манифест создаётся
- **WHEN** `{ swarm: { enabled: true } }` и генерация завершена
- **THEN** `swarm-manifest.json` создан в пути из конфига
