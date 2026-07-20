## MODIFIED Requirements

### Requirement: Config validation error recommendation is version-agnostic
The recommendation message shown when `CONFIG_VALIDATION_FAILED` error occurs SHALL use version-agnostic language. It MUST NOT reference a specific configuration schema version (e.g., "V6"). The message MUST guide users to check field names and types against "the current schema".

#### Scenario: Validation failure recommendation does not mention V6
- **WHEN** `openapi.config.json` fails schema validation
- **THEN** the error recommendation text says "correspond to the current schema" and does not include "V6" or any versioned schema reference
