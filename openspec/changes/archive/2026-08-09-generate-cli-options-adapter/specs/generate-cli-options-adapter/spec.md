## ADDED Requirements

### Requirement: Generate CLI options adapter owns CLI → TRawOptions
Система MUST собирать `TRawOptions` для команды `generate` через `resolveGenerateCliToRawOptions` в CLI adapter module. Direct path MUST валидировать flat schema внутри adapter. Config path MUST load + migrate + merge overrides внутри adapter. `generateOpenApiClient` MUST NOT вызывать второй `validateZodOptions` для flat schema.

#### Scenario: Direct mode uses adapter only
- **WHEN** CLI передает input и output
- **THEN** flat validation и merge происходят внутри adapter; caller получает raw или validation error

#### Scenario: Override keys drift test
- **WHEN** unit drift test runs
- **THEN** каждый `GENERATE_CLI_OVERRIDE_KEYS` присутствует в `generateOptionsSchema.shape`
