## Why

IndexCombine flush still goes through WriteClient-shaped `IndexCombineWriteHost` (`writeClientFullIndex` / `SimpleIndex` bindings). Architecture grill: flush on `CoreOutputAdapter` via free leaves; delete host type and Full/Simple bindings.

## What Changes

- `combineAndWrite(adapter)` / `combineAndWriteSimple(adapter)` call free index writers
- Delete `IndexCombineWriteHost`; remove WriteClient Full/Simple method bindings
- Thin `WriteClient.combine*` → `indexCombine.combine*(toCoreOutputAdapter())`
- Update FullIndex unit test to free function + adapter
- **Out of scope:** combine merge logic; finalize away from writeClient.combine*

## Capabilities

### New Capabilities

- `index-combine-core-adapter`: IndexCombine flush via CoreOutputAdapter

### Modified Capabilities

_(none — behavior bit-identical)_

## Impact

- `IndexCombineSession.ts`, `WriteClient.ts`, FullIndex test
- No BREAKING public API
