## 1. Adapter

- [x] 1.1 Добавить `CoreOutputAdapter.ts` (тип, `toCoreOutputAdapter`, `toReuseOutputAdapter`)
- [x] 1.2 Method `WriteClient.toCoreOutputAdapter()` + thin leaf wrappers

## 2. Leaves

- [x] 2.1 Конвертировать все `writeClient*` на `(adapter, options)`
- [x] 2.2 `writeSharedOrLocalCoreFile(adapter, …)`
- [x] 2.3 Обновить tests

## 3. Verify

- [x] 3.1 tsc + relevant unit tests + knip + openspec validate
