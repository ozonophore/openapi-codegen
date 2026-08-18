## Why

После `write-client-leaf-adapters` на `WriteClient` остались 9 pass-through leaf methods без production callers — shallow interface. Architecture grill: удалить bindings; тесты зовут free functions + `toCoreOutputAdapter`.

## What Changes

- Удалить 9 leaf method bindings (+ leaf imports) с `WriteClient`
- Leaf unit tests → `writeClient*(new WriteClient().toCoreOutputAdapter(), opts)`
- Delta на `write-client-leaf-adapters`: убрать scenario «Facade preserves public leaf methods»
- **Out of scope:** expected-files delta; narrow item/batch deps; leaf behavior change

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `write-client-leaf-adapters`: facade больше не обязан экспонировать leaf methods; leaves вызываются как free functions с adapter

## Impact

- `src/core/write/WriteClient.ts`, leaf `__tests__`
- Без BREAKING public API (`WriteClient` не в `core/index`)
