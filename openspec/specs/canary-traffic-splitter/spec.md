## Purpose

Генерация TrafficSplitter модуля для canary-миграций API clients.

## Requirements

### Requirement: Traffic splitter post-generation only
TrafficSplitter module MUST генерироваться после combine index step, в output first item only.

#### Scenario: Multi-item config warning
- **WHEN** trafficSplitter enabled и items.length > 1
- **THEN** warning TRAFFIC_SPLITTER_MULTI_ITEM_WARN, module пишется в output первого item

---

### Requirement: Output file location
Module MUST записываться как `{firstItemOutput}/TrafficSplitter.ts` с auto-generated header comment, без external import dependencies (все типы inline).

#### Scenario: Default output
- **WHEN** first item output `./generated` и trafficSplitter true
- **THEN** file `./generated/TrafficSplitter.ts` created без import строк

#### Scenario: Not generated when disabled
- **WHEN** trafficSplitter.enabled=false или опция отсутствует
- **THEN** TrafficSplitter.ts не создаётся

---

### Requirement: Strategy routing semantics
Generated TrafficSplitter MUST support strategies weighted, round-robin, header-based, header-and-weighted.

#### Scenario: Weighted routing
- **WHEN** strategy weighted, newClientWeight=10, clientId=user-1
- **THEN** route determined by hash(clientId) % 100 < newClientWeight

#### Scenario: Round-robin alternation
- **WHEN** strategy round-robin и routeRequest вызван 4 раза подряд
- **THEN** результаты чередуются: false, true, false, true

#### Scenario: Header-based routing
- **WHEN** strategy header-based, headerName X-Version, headerValues old v1 new v2, headers X-Version v2
- **THEN** isNewClient=true

#### Scenario: Header-and-weighted fallback
- **WHEN** strategy header-and-weighted и header absent
- **THEN** falls back to weighted routing

---

### Requirement: Sticky sessions with TTL
When stickySessions true, route MUST be stable per clientId within sessionDuration (форматы 1h, 30m, 2d). По истечении TTL route MAY пересчитаться.

#### Scenario: Sticky hit within TTL
- **WHEN** stickySessions true, clientId known, session not expired
- **THEN** stickySessionHits incremented, same isNewClient as first request

#### Scenario: Expired session
- **WHEN** TTL expired для clientId
- **THEN** следующий request не гарантированно возвращает тот же isNewClient

#### Scenario: Bad duration string
- **WHEN** sessionDuration unparseable
- **THEN** TTL defaults to 3600000 ms (1 hour)

---

### Requirement: Generation failure is non-fatal
Exception during traffic splitter write MUST be caught and logged as warning without failing main generation.

#### Scenario: Write error
- **WHEN** output directory not writable
- **THEN** warning "trafficSplitter: failed to generate module", main run success if generation ok
