## Why

Options meaning размазан: Zod validate с `process.exit` в `validateRawOptions`, flatten/inherit/defaults private на `OpenApiClient`. Programmatic path токсичен из‑за exit. Шесть полей из `unifiedItemSchema` (`interfacePrefix`, `enumPrefix`, `typePrefix`, `useCancelableRequest`, `sortByRequired`, `useSeparatedIndexes`) на HEAD перетираются root — item override теряется.

## What Changes

- `resolveGenerationOptions(raw): TStrictFlatOptions[]`: validate (**throws**) + flatten/inherit + defaults + marauder merge.
- Item-level `item.X ?? rawOptions.X` для шести schema fields выше. Сохранить HEAD `miracles: item.miracles ?? root`.
- `OpenApiClient.generate(rawOptions)` вызывает resolve; удалить private normalize/defaults/marauder.
- `core/index.ts` `generate` больше не вызывает `validateRawOptions`.
- Удалить `validateRawOptions.ts` (`process.exit`).

**Out of scope:** field-list collapse, CLI override keys, ctor-injected OpenApiClient, Diff/Write/item rethink.

## Capabilities

### New Capabilities

- `generation-options-resolve`: validate throw + flatten/defaults; item overrides for schema fields; delete exit validate

### Modified Capabilities

- `miracles-config-runtime`: inheritance через `resolveGenerationOptions`
- `models-classes-layout`: defaults stage = Generation options resolve
- `reuse-shared-core`: эффективный `request` после resolve

## Impact

- New `resolveGenerationOptions.ts`; slim `OpenApiClient.ts`; delete `validateRawOptions.ts`
- Tests: item overrides + throw on invalid
- `CONTEXT.md`
- Programmatic invalid options: thrown Error instead of `process.exit`
