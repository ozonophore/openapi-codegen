## ADDED Requirements

### Requirement: Operation parse Follows after parameter and requestBody `$ref`
When an operation (or path item) lists a parameter or requestBody by Tree `$ref`, parse MUST `$ref` lookup that object and then Follow before nested schema `$ref` lookup. Inline parameter schemas MUST receive that Follow Parent source file, not an empty parent. OAS2 parameters and OAS3 parameters and requestBody MUST behave the same. Response `$ref` Follow (already required in PDTCH-200) MUST stay.

#### Scenario: Cross-file parameter `$ref` with nested relative schema
- **WHEN** an operation parameter is `$ref` to another file’s parameter object, and that object’s schema uses a relative file Tree `$ref`
- **THEN** the generated parameter type MUST come from the schema file next to the parameter file, not from a join against the operation file

#### Scenario: Cross-file requestBody `$ref` with nested relative schema
- **WHEN** an OAS3 operation requestBody is `$ref` to another file’s requestBody object, and that object’s schema uses a relative file Tree `$ref`
- **THEN** the generated body type MUST come from the schema file next to the requestBody file

#### Scenario: Inline parameter schema keeps Follow parent
- **WHEN** a parameter object (after Follow if it was `$ref`’d) has an inline schema whose nested Tree `$ref` is a relative file
- **THEN** `$ref` lookup MUST use that parameter’s Parent source file, not an empty parent
