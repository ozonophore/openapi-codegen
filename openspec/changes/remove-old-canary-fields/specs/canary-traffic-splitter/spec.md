## MODIFIED Requirements

### Requirement: Strategy routing semantics
Generated TrafficSplitter MUST support strategies weighted, round-robin, header-based, header-and-weighted. Canary weight MUST be `newClientWeight` only (0–100). Header match MUST use `headerValues.new` only. The schema MUST NOT accept `oldClientWeight` or `headerValues.old`.

#### Scenario: Weighted routing
- **WHEN** strategy weighted, newClientWeight=10, clientId=user-1
- **THEN** route determined by hash(clientId) % 100 < newClientWeight

#### Scenario: Round-robin alternation
- **WHEN** strategy round-robin и routeRequest вызван 4 раза подряд
- **THEN** результаты чередуются: false, true, false, true

#### Scenario: Header-based routing
- **WHEN** strategy header-based, headerName X-Version, headerValues.new v2, headers X-Version v2
- **THEN** isNewClient=true

#### Scenario: Header-and-weighted fallback
- **WHEN** strategy header-and-weighted и header absent
- **THEN** falls back to weighted routing

#### Scenario: Dead canary fields rejected
- **WHEN** config includes `oldClientWeight` or `headerValues.old`
- **THEN** schema validation fails
