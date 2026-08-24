## ADDED Requirements

### Requirement: VirtualFileMap module
Система ДОЛЖНА предоставлять модуль `VirtualFileMap` (`src/core/specLoad/VirtualFileMap.ts`), инкапсулирующий маппинг выходных путей для одного item генерации. Модуль строится фабрикой `buildVirtualFileMap(refs, refLookup, entryFile, output)` и после построения самодостаточен — не требует доступа к $Refs для работы.

#### Scenario: Resolve known canonical ref
- **WHEN** вызывается `map.resolve(canonicalRef)` для Canonical Ref, присутствующего в виртуальной карте
- **THEN** возвращается `{ outputFile: string, fragment?: string }` с абсолютным путём к `.ts`-файлу

#### Scenario: Resolve unknown canonical ref
- **WHEN** вызывается `map.resolve(canonicalRef)` для Canonical Ref, отсутствующего в карте
- **THEN** возвращается `undefined`

#### Scenario: Resolve remote ref
- **WHEN** вызывается `map.resolve(canonicalRef)` для `http(s)://` Canonical Ref
- **THEN** возвращается `undefined` (Remote $ref не имеет Output mapping)

#### Scenario: Resolve with parent source file
- **WHEN** вызывается `map.resolve(ref, parentSourceFile)` с относительным Tree $ref и parentSourceFile
- **THEN** Tree $ref разрешается в Canonical Ref через RefLookup и возвращается корректный outputFile

#### Scenario: Get canonical refs
- **WHEN** вызывается `map.getCanonicalRefs()`
- **THEN** возвращается массив всех Canonical Refs, собранных во время построения карты (`walkSchemaForFragments`)

#### Scenario: Output paths access
- **WHEN** обращаются к `map.output`
- **THEN** возвращается объект `OutputPaths`, переданный в `buildVirtualFileMap`

### Requirement: VirtualFileMap construction
`buildVirtualFileMap(refs, refLookup, entryFile, output)` ДОЛЖНА строить полностью инициализированную карту: инициализировать запись для entry file, пройти все пути из `refs.paths()`, обойти схемы для сбора canonical refs и фрагментов. ДОЛЖНА принимать `refLookup` как аргумент — не строить свой.

#### Scenario: Entry file always in map
- **WHEN** строится VirtualFileMap с локальным entryFile
- **THEN** запись для entryFile присутствует в карте с корректным outputFile

#### Scenario: Remote entry file skipped
- **WHEN** entryFile является `http(s)://` URL
- **THEN** для него не создаётся запись в виртуальной карте

#### Scenario: Shared RefLookup
- **WHEN** `buildVirtualFileMap` принимает refLookup
- **THEN** тот же экземпляр используется для `toCanonicalRef` в `resolve()` — новый RefLookup не создаётся
