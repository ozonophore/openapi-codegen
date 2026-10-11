## ADDED Requirements

### Requirement: Follow after `$ref` lookup
After `$ref` lookup returns an object, Tree `$refs` nested inside that object MUST use Follow: Parent source file is the source file of that object’s Canonical Ref. If that source file is empty, Follow MUST keep the caller’s Parent source file. An empty parent MUST NOT be used as Follow.

#### Scenario: Nested relative Tree `$ref` joins from the component file
- **WHEN** a Tree `$ref` points at an object in another opened file, and that object contains a relative file Tree `$ref`
- **THEN** `$ref` lookup of the nested Tree `$ref` MUST use the component file as Parent source file, not the caller’s file

#### Scenario: Pointer-only Canonical Ref keeps the caller parent
- **WHEN** Follow is applied to a Canonical Ref whose source file is empty
- **THEN** Parent source file for nested Tree `$refs` MUST remain the caller’s Parent source file
