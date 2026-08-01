## MODIFIED Requirements

### Requirement: generateOptionsBaseSchema принимает поля plugins и strictPluginMode
`generateOptionsBaseSchema` в `src/cli/schemas/generate.ts` MUST включать
`plugins` как `z.array(z.string()).optional()` и `strictPluginMode` как
`z.boolean().optional()`. `mergeGenerateCliOverrides` MUST сливать CLI `plugins`
с конфигом через `mergePluginPaths` и MUST передавать `strictPluginMode` как scalar
override.

#### Scenario: Схема принимает plugins и strictPluginMode
- **WHEN** raw options содержат `plugins: ['./a.cjs']` и `strictPluginMode: true`
- **THEN** Zod-валидация проходит успешно

#### Scenario: CLI plugins сливаются в конфиг
- **WHEN** конфиг содержит `plugins: ['./from-config.cjs']`, а CLI передаёт `plugins: ['./from-cli.cjs']`
- **THEN** в merged config effective plugins включают оба пути в порядке config-first
