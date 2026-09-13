## MODIFIED Requirements

### Requirement: флаг --traffic-splitter для команды generate
Команда `generate` ДОЛЖНА принимать булев флаг `--traffic-splitter`, включающий функцию `trafficSplitter` со значениями по умолчанию (`enabled: true`, `strategy: "weighted"`, вес через `newClientWeight`). Поддержка dot-notation ДОЛЖНА быть обеспечена для `strategy`, `newClientWeight`, `stickySessions`, `sessionDuration`, `headerName` и `headerValues` (`new` only). Флаг MUST NOT принимать `oldClientWeight` или `headerValues.old`.

#### Scenario: флаг включает trafficSplitter со значениями по умолчанию
- **WHEN** пользователь запускает `openapi-codegen generate --traffic-splitter --openapi-config ./openapi.config.json`
- **THEN** `{ trafficSplitter: true }` сливается в конфиг, в результате чего сгенерированный вывод содержит модуль `TrafficSplitter.ts` с weighted-стратегией по умолчанию

#### Scenario: переопределение стратегии через dot-notation
- **WHEN** пользователь запускает `openapi-codegen generate --traffic-splitter.strategy=round-robin`
- **THEN** `trafficSplitter.strategy` устанавливается в `"round-robin"` в итоговом конфиге
