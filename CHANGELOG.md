# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0-beta.8] — 2026-01-28

### Added
- Added interceptor support to the client core:
  - `withInterceptors`;
  - `interceptors`;
  - `apiErrorInterceptor`.
- Introduced a new executor structure:
  - dedicated `core/executor` directory;
  - added `requestExecutor`.
- Added snapshot tests for executor and interceptors for OpenAPI v2 and v3.

### Changed
- Refactored executor architecture:
  - `createExecutorAdapter` and `request-executor` templates moved to `core/executor`;
  - updated template registration and generation logic.
- Updated client core templates:
  - `ApiError`;
  - `CancelablePromise`;
  - `HttpStatusCode`.
- Updated client generation logic:
  - `WriteClient`;
  - `writeClientCore`.
- Updated client index generation (`indexCore`, `indexFull`).
- Updated client and service export templates.
- Updated documentation (`README.md`, `README.rus.md`).

### Removed
- Completely removed the legacy request executor and related snapshot tests.

### Tests
- Significantly updated snapshot coverage for client generation for OpenAPI v2 and v3.
- Added snapshot tests for interceptors and the new executor.

## [2.0.0-beta.7] — 2026-01-22

### Added
- Added new model snapshot tests for OpenAPI v2 and v3, including:
  - circular references;
  - nested and compositional schemas;
  - enum types and collections.
- Added extended test coverage for scenarios with different $ref strategies (`v3_withDifferentRefs`).
- A new OpenAPI specification has been added for testing the alternative structure of `$ref`.

### Changed
- Refactored model and type parsing logic for OpenAPI v2 and v3:
  - updated `getModels` and `getType`;
  - improved handling of complex and nested schemas.
- Updated client generation Context.
- Improved OpenAPI spec loading and processing (`getOpenApiSpec`).
- Improved namespace handling (`stripNamespace`).
- Updated filesystem helper utilities.
- Updated OpenAPI config initialization types and logic in CLI.
- Updated project dependencies and configuration.

### Removed
- Completely removed legacy `$ref` resolution logic:
  - removed related helper types, enums, and utilities;
  - removed associated unit tests.
- Removed obsolete schema snapshot tests and legacy request adapter snapshots.

### Tests
- Significantly expanded snapshot test coverage for:
  - models;
  - services;
  - core client artifacts.
- Updated existing snapshot tests for OpenAPI v2 and v3.

## [2.0.0-beta.6] — 2026-01-22

### Added
- Function `isSameFilePath` added to centralized `fileSystemHelpers` module for better file path comparison
- Helper `camelCase` added for Handlebars template processing
- New executor adapter generation (`createExecutorAdapter.hbs`) replacing the outdated query adapter
- Template types model exported to support better type registration

### Changed
- `Templates` type moved from core module to dedicated `src/core/types/base/Templates.model.ts` file for better organization
- `resolveRefToImportPath` function refactored to handle external file references more robustly
- Handlebars template registration logic simplified
- Service options template (`serviceOption.hbs`) improved with better parameter handling
- Index files refactored for clearer exports structure (`indexCore.hbs`, `indexFull.hbs`, `indexSimple.hbs`)

### Removed
- Legacy query adapter (`legacy-request-adapter.hbs`) removed in favor of new executor adapter approach

### Fixed
- Self-reference check added to `resolveRefToImportPath` for proper external file link resolution
- Improved handling of edge cases in template compilation

### Tests
- Updated unit tests for `resolveRefToImportPath` function with new test cases
- Updated snapshot test files for both OpenAPI v2 and v3 specifications
- Updated WriteClient test suite with executor adapter test cases

## [2.0.0-beta.5] - 2026-01-21

### Added
- New init CLI command for OpenAPI configuration initialization.
- Step-by-step initialization flow:
  - OpenAPI specification discovery and validation;
  - configuration file generation;
  - custom request or request executor generation.
- Utilities for:
  - specification file discovery;
  - single and multiple spec validation;
  - config generation and writing;
  - Handlebars template registration for CLI.
- New CLI templates and their compiled counterparts.
### Changed
-Updated CLI entrypoint and option schemas for the init command.
-Refactored OpenAPI config initialization logic:
  - logic split into reusable, well-scoped modules.
-Updated shared constants and filesystem helper utilities.
-Improved $ref to import path resolution in core generation logic.
-Updated openApiConfig template.
### Removed
-Removed deprecated runInitOpenapiConfig initialization command.
### Fixed
-Fixed relative $ref resolution for external files and nested directories.
-Fixed cases where parentFilePath points to a directory instead of a file.

## [2.0.0-beta.4] - 2026-01-18

### Added
- Introduced a new CLI command previewChanges that allows previewing generated code changes without writing them to disk.
- Implemented a set of utilities for file and directory comparison, diff formatting, and output path updates.
- Added documentation for the previewChanges command.
### Changed
- Refactored OpenAPI client generation:
- Generation logic was renamed and restructured for better clarity and extensibility.
- Updated configuration schemas (UnifiedOptionsSchema v1 and v2).
- Improved filesystem helper utilities.
- Updated Handlebars client templates and their compiled counterparts.
- Enhanced request executor logic and service parameter/option generation.
### Tests
- Updated unit tests and snapshot tests for OpenAPI v2 and v3.
- Refreshed snapshots for services, types, parameters, multipart requests, and response handling.
- Removed obsolete snapshots.
### Misc
- Updated dependencies (package.json, package-lock.json).
- Removed deprecated documentation (Note.md).

## [2.0.0-beta.3] - 2026-01-08

### Added
- Added Zod-based validation system for CLI options and configuration files, providing better type safety and validation.
- Added CLI schema modules (`src/cli/schemas/`) for command-specific validation:
  - `base.ts` - base CLI options schema
  - `checkConfig.ts` - check-config command schema
  - `generate.ts` - generate command schema with conditional validation
  - `init.ts` - init command schema
  - `updateConfig.ts` - update-config command schema
- Added CLI schema modules (`src/common/schemas/`) for command-specific validation:
  - `configSchemas.ts` - unified configuration file schemas (TRawOptions, TFlatOptions, TItemConfig)
- Added validation module (`src/cli/validation/`) with error formatting utilities:
  - `validateCLIOptions.ts` - Zod-based validation functions with formatted error messages
  - `errorFormatter.ts` - CLI-friendly error message formatting

### Changed
- Refactored `TRawOptions.ts` to re-export types from Zod schemas, ensuring consistency between types and validation rules.
- Updated `runGenerateOpenApi.ts` to use Zod validation for CLI options before processing, improving error detection and user experience.
- Enhanced validation logic: added conditional checks (e.g., `excludeCoreServiceFiles` vs `request` compatibility, required `input`/`output` when config file is missing).

## [2.0.0-beta.2] - 2026-01-07

### Added
- Added `validationLibrary` parameter to support multiple validation library options for schema generation: `none`, `zod`, `joi`, `yup`, `jsonschema`.
- Added Handlebars templates for validation schema generation:
  - Zod validation schemas (`zod/exportSchema.hbs` and partials)
  - Yup validation schemas (`yup/exportSchema.hbs` and partials)
  - Joi validation schemas (`joi/exportSchema.hbs` and partials)
  - JSON Schema validation schemas (`jsonschema/exportSchema.hbs` and partials)
- Added `ValidationLibrary` enum to define supported validation libraries.
- Added migration plan from `UNIFIED_v1` to `UNIFIED_v2` schema that migrates `includeSchemasFiles` to `validationLibrary`.

### Changed
- **BREAKING**: Replaced `includeSchemasFiles` boolean parameter with `validationLibrary` enum parameter for more flexible validation schema generation.
- Updated schema generation logic to support multiple validation libraries with library-specific templates.
- Updated `writeClientSchemas` to use validation library-specific templates based on the selected library.

### Removed
- **BREAKING**: Removed `includeSchemasFiles` parameter (replaced by `validationLibrary`).

### Migration Notes
- The `includeSchemasFiles` parameter is automatically migrated to `validationLibrary`:
  - `includeSchemasFiles: false` → `validationLibrary: 'none'`
  - `includeSchemasFiles: true` → `validationLibrary: undefined` (will use default, typically `'none'`)
- To generate validation schemas, set `validationLibrary` to one of: `'zod'`, `'joi'`, `'yup'`, or `'jsonschema'`.
- Default value is `'none'` (no validation schemas generated).

## [2.0.0-beta.1] - 2026-01-06

### Added
- Added core `RequestExecutor` / `RequestConfig` abstraction and Handlebars template to generate a type-safe request executor interface in the core layer.
- Added `legacy-request-adapter` core template and generated file that adapts the existing `request(options: ApiRequestOptions, config: OpenAPI)` runtime to the new `RequestExecutor` interface, preserving compatibility with current HTTP client implementations.

### Changed
- **BREAKING**: Updated service generation templates to build thin service classes over `RequestExecutor` instead of calling the core `request` function directly; service methods now accept optional transport options and delegate requests to an injected executor.
- Updated Handlebars templates registration and `writeClientCore` to emit the new core files (`request-executor.ts`, `legacy-request-adapter.ts`) alongside existing `ApiRequestOptions`, `OpenAPI` and `request` runtime files.
- Adjusted service option templates to construct `RequestConfig` objects consumed by the new `RequestExecutor` abstraction.

## [2.0.0-beta.0] - 2025-12-28

### Added
- Added new `OpenApiClient` class (`src/core/OpenApiClient.ts`) as the main entry point for code generation, providing better separation of concerns and improved error handling.
- Added centralized logger messages module (`src/common/LoggerMessages.ts`) for all logging text constants, enabling centralized management and internationalization support.
- Added unified options schema system (`UnifiedOptionsVersioned`) supporting migration from legacy `OPTIONS` and `MULTI_OPTIONS` schemas to a unified format.
- Added `AllVersionedSchemas` and `AllMigrationPlans` modules to support cross-schema migrations (from OPTIONS/MULTI_OPTIONS to UNIFIED_OPTIONS).
- Added `getRelativeModelImportPath` utility function for improved relative path calculation for model imports.
- Added utility functions `createDefaultFieldsMigration` and `createTrivialMigration` to simplify migration plan creation.
- Added TypeScript type definitions for `mkdirp` and `rimraf` packages in `src/typings/`.

### Changed
- **BREAKING**: Refactored options structure: renamed `Options.ts` to `TRawOptions.ts` and introduced new type system with `TRawOptions`, `TFlatOptions`, and `TStrictFlatOptions` for better type safety.
- **BREAKING**: Updated core API: `generate()` function now uses `OpenApiClient` internally, providing improved error handling and logging capabilities.
- Refactored code generation flow: moved generation logic from direct function calls to `OpenApiClient` class methods for better maintainability.
- Enhanced schema migration system: improved migration plans for `OPTIONS` and `MULTI_OPTIONS` schemas with better default value handling.
- Updated all parsers (v2 and v3) to work with the new `OpenApiClient` architecture.
- Improved logger integration: all logging messages now use centralized `LOGGER_MESSAGES` constants.
- Updated `WriteClient` and `Context` classes to work with the new architecture.

### Removed
- **BREAKING**: Removed `getModelNameWithPrefix` utility function (functionality integrated into model helpers).
- **BREAKING**: Removed `normalizeString` utility function (functionality moved to other helpers).
- **BREAKING**: Removed `prepareOptions` utility function (options preparation now handled by `OpenApiClient`).
- Removed `knip.json` configuration file.
- Removed obsolete snapshot test file `test/__snapshots__/v2/services/V2Service.ts.snap`.

### Fixed
- Fixed relative import path calculation for models in complex nested scenarios.
- Improved error handling in code generation process with better logging and error messages.
- Enhanced schema migration reliability with better validation and error reporting.

### Migration Notes
- If you're using the `generate()` function directly, the API remains compatible, but internal implementation has changed.
- Configuration files using old `OPTIONS` or `MULTI_OPTIONS` schemas will be automatically migrated to `UNIFIED_OPTIONS` format.
- Custom code using removed utility functions (`getModelNameWithPrefix`, `normalizeString`, `prepareOptions`) should be updated to use the new architecture.

## [1.0.0] - 2025-12-27

### Changed
- Improved `UpdateNotifier.checkAndNotify()` method with better caching logic: now checks cached update info first before performing network requests, providing faster response times for subsequent runs.
- Enhanced error handling in CLI: improved parsing error handling for unknown command options with proper error logging.
- Updated all CLI commands to use async `checkAndNotify()` method instead of synchronous version for better reliability and non-blocking behavior.
- Refactored logger lifecycle management: removed `shutdownLogger()` call from `UpdateNotifier` - logger lifecycle is now managed at application level for better control.

### Deprecated
- `UpdateNotifier.checkAndNotifySync()` method is now deprecated. Use `checkAndNotify()` instead.

### Fixed
- Fixed update notification caching to prevent duplicate notifications and properly clear cache after showing updates.
- Improved error handling in update check process to prevent failures from breaking the main CLI workflow.

## [1.0.0-beta.14] - 2025-12-23

### Added
- Added helper `getModelNameWithPrefix` to centralize generation of model names with interface/enum/type prefixes.
- Added `normalizeString` utility and integrated it into Handlebars helpers registration to normalize model and schema names in templates.
- Added CLI executable header (`#!/usr/bin/env node`) to the main entrypoint so the generator can be invoked directly as a shell command.

### Changed
- Updated OpenAPI v2/v3 parsers (`Parser`, `getModels`, `getType`) and core exports (`Context`, `index`) to use the new model naming and path calculation utilities.
- Adjusted `getRelativeModelPath` to work with the updated naming rules and to better align model, schema and import paths across different platforms.
- Updated CLI bootstrap in `src/core/index.ts` to call `program.exitOverride()` so CLI exits are correctly propagated to external tooling.
- Updated `package.json` to expose the `openapi-codegen-cli` binary, publish type declarations from `dist/index.d.ts`, and ship the `example/` directory as part of the package.

### Fixed
- Fixed generation of relative import paths for models and their schemas in complex nesting and cross-file reference scenarios for both OpenAPI v2 and v3.
- Synchronized v2/v3 snapshot tests for models and schemas with the corrected model names and import paths.

### Removed
- Removed deprecated `getRelativeModelImportPath` utility and its unit tests.
- Removed legacy ambient typings for `mkdirp` and `rimraf`; remaining custom typings were consolidated under the `types/` directory.

## [1.0.0-beta.13] - 2025-12-18

### Added
- Added collection of coverage metrics during the launch of unit tests
- Added centralized file system helpers module (`src/common/utils/fileSystemHelpers.ts`) with unified API for file operations:
  - Promisified versions of Node.js fs functions (readFile, writeFile, copyFile, exists)
  - Recursive directory creation (`mkdir`) and removal (`rmdir`) functions
  - Path checking utilities (`isDirectory`, `isPathToFile`)
- Enhanced `resolveRefToImportPath` function to handle all types of ref references to specification files:
  - Improved handling of HTTP URLs, local fragments, external file fragments, external files, and absolute paths
  - Better path resolution for external files and directories
  - Enhanced support for complex reference scenarios

### Changed
- Refactored file system utilities: consolidated scattered file system operations into centralized `fileSystemHelpers` module
- Updated all write client utilities (`writeClientCore`, `writeClientModels`, `writeClientServices`, `writeClientSchemas`, `writeClientFullIndex`, `writeClientSimpleIndex`) to use new `fileSystemHelpers` API
- Updated `resolveRefToImportPath` to use `fileSystemHelpers.isDirectory` and `fileSystemHelpers.isPathToFile` for better path detection
- Updated `getOpenApiSpec` and `appendUniqueLinesToFile` to use new file system helpers
- Updated CLI utilities (`updateExistingConfigFile`, `writeExampleConfigFile`, `runInitOpenapiConfig`) to use centralized file system helpers
- Updated all test files to use new `fileSystemHelpers` module instead of deprecated utilities

### Removed
- Removed deprecated `src/core/utils/fileSystem.ts` file (functionality moved to `fileSystemHelpers`)
- Removed deprecated `src/core/utils/isDirectory.ts` file (functionality moved to `fileSystemHelpers`)

### Fixed
- Fixed path resolution issues in `resolveRefToImportPath` when dealing with external files and directories
- Improved error handling in file system operations with better path normalization

## [1.0.0-beta.12] - 2025-12-16

### Added
- Added new CLI module `checkAndUpdateConfig` with comprehensive config validation and migration:
  - `checkConfig.ts` - main configuration checking logic
  - `updateConfig.ts` - config file update mechanism
  - `types.ts` - TypeScript types for config operations
  - `constants.ts` - configuration-related constants
  - Utility functions: `generateConfigExample`, `prepareConfigData`, `removeDefaultConfigValues`, `rewriteConfigFile`, `selectConfigAction`, `updateExistingConfigFile`, `validateAndMigrateConfigData`, `writeConfigFile`, `writeExampleConfigFile`
- Added interactive CLI dialogs:
  - `confirmDialog.ts` - yes/no confirmation prompts
  - `selectDialog.ts` - selection dialogs for user choices
  - `types.ts` and `constants.ts` for interactive module
- Added utility functions `getCurrentErrorMessage` and `getKeyByMapValue` to VersionedSchema Utils

### Changed
- Refactored CLI structure: moved `chekOpenApiConfig` logic into the new `checkAndUpdateConfig` module
- Reorganized common utilities: moved test files and utility functions from `src/common/__tests__/` and `src/core/utils/` to `src/common/utils/__tests__/` and `src/common/utils/`
- Updated all import paths in test files to reflect new utility locations
- Enhanced `runGenerateOpenApi.ts` with improved error handling and logging

### Fixed
- Updated test imports across all core utilities to reference relocated files
- Improved path resolution in core parser tests (v2 and v3)
- Fixed test expectations for schema version matching and type resolution

### Removed
- Deleted deprecated `src/cli/chekOpenApiConfig/chekOpenApiConfig.ts` file

### Updated
- Updated package.json dependencies
- Updated test files for relocated utilities (see src/core/utils/__tests__ and src/common/utils/__tests__)
- Enhanced WriteClient tests with additional assertions

## [1.0.0-beta.11] - 2025-12-12

### Added
- Added regular expressions to handle different situations in file paths (to handle template paths).
- Added an auxiliary function for processing paths in templates - `normalizePath`.
- Added an auxiliary function for combining path parts in templates - `joinPath`.
- Added an auxiliary function to detect the use of names reserved by the system - `containsSystemName`.

### Changed
- The use of auxiliary functions from the `path` package has been replaced with improved options from `pathHelpers`.
- Auxiliary functions of `resolveHelper` have been moved to the `common/utils/` directory

## [1.0.0-beta.10] - 2025-12-11

### Added
- Added path processing for external files to the `resolveRefToImportPath` function.

### Changed
- Unit tests for the `getType` function are temporarily disabled.

## [1.0.0-beta.9] - 2025-12-10

### Changed
- Instead of the `get` function from the npm package `Lodash-es`, the `safeHasOwn` function is used
- Functions from the file `common/Utils.ts` are placed in separate files with the appropriate name in the directory `common/utils/`

### Deleted
- Removed the use of the npm package `Lodash-es`

## [1.0.0-beta.8] - 2025-12-06

### Added
- Added the CLI command of the `init-openapi-config` tool. Generates a configuration file template for starting code generation based on openapi specification files.
- Added a parameter to specify the configuration file (default: `openapi.config.json`) in the CLI command of the `check-openapi-config` tool.
- Added a parameter to specify the configuration file (default: `openapi.config.json`) in the CLI command of the `generate` tool.
- Added a template file (hbs) to generate a configuration file (default: `openapi.config.json`).

### Changed
- Changed the layout of templates (hbs files) for generating code according to openapi specifications.

## [1.0.0-beta.7] - 2025-11-30

### Added
- Added/updated CLI examples and configuration schema in example/openapi.config.json and README.md to reflect new CLI parameters.
- Added tests and utilities updates around WriteClient behavior.

### Changed
- CLI surface — updated set of command line parameters and validation logic:
  - Renamed and reorganized several flags and options in src/cli/index.ts and src/cli/utils.ts.
  - Updated options handling and migration code in src/common/VersionedSchema/* and src/common/Options.ts to support the new options shape.
- WriteClient refactor:
  - Reworked WriteClient internals (src/core/WriteClient.ts) and related helpers (src/core/utils/writeClient*.ts) for more robust I/O, error handling and clearer responsibilities.
  - Adjusted tests: src/core/__tests__/WriteClient.test.ts and multiple writeClient unit tests under src/core/utils/__tests__.
- Versioned options schema updates and migration plans (src/common/VersionedSchema/*) to support new CLI/config formats.

### Fixed
- Parser.getType path/import generation (v3):
  - Do not prefix "./" to paths that already start with "." (e.g., "../...") or "/" (absolute).
  - Avoid adding import entries when resolved path is empty.
  - Preserve correct relative transitions / safe fallbacks when resolving parent references.
  - Changes implemented in src/core/api/v3/parser/getType.ts and mirrored in v2 where applicable.
- Utilities:
  - Fixed and stabilized path resolution helpers: resolveRefToImportPath, getAbsolutePath and related tests.
  - Corrected getGatheringRefs behaviour and adjusted test expectations to match actual reference classification.
- Tests:
  - Updated many unit tests to reflect corrected path and import behaviour (see src/core/api/**/__tests__ and src/core/utils/__tests__).

### Updated
- Updated unit tests across the codebase to align with changed path resolution, WriteClient behavior and CLI parameters.
- Updated documentation and examples (README, example/).

### Notes
- Changes are mostly internal and test/CLI-related. Public API surface of generated clients remains compatible, but configuration CLI/options have changed — review migration notes and examples.

## [1.0.0-beta.6] - 2025-08-22

### Added

- Added a command to check the configuration file;
- Added a mechanism for checking and notifying of exits;

### Fixed

- Refactoring: Improved logic for processing generated data and writing files to disk;
- Fixed the "IsReadOnly" template. Previously, a property with the readonly attribute had a problem generating it. Added an extra transition to a new line;

## [1.0.0-beta.5] - 2025-08-09

### Added

- Added a function for a simplified way to sort arguments for service functions. The simplified sorting option is similar to the one used in version 0.2.3 of the OpenAPI generator;
- Added the function of an extended option for sorting arguments of service functions;
- Added a flag for selecting a sorting strategy for arguments of service functions in the CLI tool;

### Updated

- Updated the description in the README file;

## [1.0.0-beta.4] - 2025-08-02

### Added

- Added a mechanism for matching an incoming set of parameters with a list of invalid values;
- Added the definition of the most appropriate schema version;
- Added unit tests for new functions;

### Updated

- Updated the function for collecting unique keys from an array of validation schemes for a set of parameters;

## [1.0.0-beta.3] - 2025-07-24

### Added

- Added logging using the npm package winston;
- Added the function of converting an array of option parameters into a multiple option model;
- Added Joi schema filling for a set of options for checking default values;
- Added a count of the time spent on code generation with information output to the terminal;

### Fixed

- Fixed the migration plan for multiple options;
- Fixed unit tests for migrating option sets;

## [1.0.0-beta.2] - 2025-07-22

### Added
- Added a mechanism for matching different versions of generator parameter sets to maintain backward compatibility;
- Added a mechanism for detecting typos when using generator options via a CLI tool or configuration file;
- Added a check of the tool's cli options for default values to determine further action scenarios;
- Added an assistant utility for processing system words in names (templates);

### Updated

- The models of the generator option sets for the start of generation have been changed;
- The tool's cli code has been moved to the cli catalog, and edits have been made to the logic of the tool's cli operation before generating it;
- Duplicate sections of code have been combined;

## [1.0.0-beta.1] - 2025-06-27

### Added

- Added snapshot unit tests;

## [1.0.0-beta.0] - 2025-06-12

### Added
- Added the use of nodejs native tests (unit tests);

### Deleted
- The "samples" and "site" sections have been removed;
- Jest has been remobed;

### Updated
- Changed the folder structure of the project;
- Template files (hbs) go through a pre-compilation process before use;
- Rollup has been removed, the assembly is based on tsc tools;
- Changed the settings of github workflows (CI, Deploy);
- Changes have been made to the eslint settings to improve code purity;
- The typescript version has been raised;
- The nodejs version has been raised;

## [0.5.1] - 2025-05-15

### Fixed
- Fixed  the content of the template to create a file with the service code.
- Fixed the file generation path in the unit test (src/index.spec.ts).

## [0.5.1-rc.3] - 2025-05-15

### Added
- Added formatting of hbs templates using prettier

### Fixed
- Fixed a cross-platform error when calculating relative paths

## [0.5.1-rc.2] - 2025-04-08

### Updated
- Updated the end-path calculation mechanism: core, models, services, schemas
- Updated the tests to reflect the changes made
- Updated examples of custom options for request

### Fixed
- Fixed the relative path calculation mechanism for importing a model
- Fixed broken tests

## [0.5.1-rc.1] - 2025-01-21

### Added
- Added a test for the function getAbsolutePath
- Added a test for the function getGatheringRefs

### Fixed
- Fixed an error in generating models according to the specification when the schema referred to the schema in another file. And the schema from the file referred to the schema inside the same file.

### Updated
- Moved the gatheringRefs function to a separate file

## [0.5.0-beta.0] - 2024-08-01

### Added
- Added formData support in V3

### Updated
- Update the test (test/index.spec.ts) to typescript

## [0.4.0-beta.0] - 2023-11-12

### Updated
- Updated the tests to use typescript;
- Updated getting the final path to the service;
- Updated request files;
- Updated function for getting request URL;
- Updated service generation template.

### Added
- Added the ability to specify your OpenApi configuration for requests.

## [0.3.1-rc.1] - 2023-10-18

### Fixed
- Fixed the normalization of the relative path during the calculation of the relative path of the model.
- Fixed a mechanism for calculating the required number of transitions to the dictory above.
- Fixed the value of the path separator for the formation of a relative path.

## [0.3.1-rc.0] - 2023-10-12

### Fixed
- Fixed the conversion of lines into an array of lines inside the function calculateRelationPath (incoming parameters).
- Fixed typification of generator options used in the function generate.
- Fixed the use of the function of obtaining a relative path of the model.
- Fixed the logic of the getType function to specify version 2.
- Fixed the installation of the prefix for the interface (interfacePrefix).
- Fixed the installation of the prefix for the enum (enumPrefix).
- Fixed the installation of the prefix for the type (typePrefix).

### Updated
- Updated the unit test for the function getType.
- Updated the class Parser to specify version 2.

### Deleted
- Deleted all unused imports and unused utiliities.

## [0.3.1-beta.3] - 2023-07-14

### Fixed
- Fixed generation of relative import path and model relative path when generating on Windows OS.

### Modefied
- Modefied function separation (OpenAPI) namespace from values. Functionality merged into one function.
- Modified the type matching function for the passed type to any underlying Typescript/Javascript type. Functionality merged into one function.

### Skipped
- Skipped type get check test. Due to the fact that you need to separately rewrite this method by analogy with getType v3

## [0.3.1-beta.2] - 2023-05-24

### Fixed
- Removed function preProcessWriteModel
- Made a small refactoring of the code for generating models and schemes
- When forming a relative path, the situation is taken into account when the root folder is not set
- The formation of the relative path of the model and import of the model is moved to the getModels function

## [0.3.1-beta.1] - 2023-05-15

### Added
- Added unit test for function getRelativeModelImportPath
- Added unit test for function getRelativeModelImportPath

### Fixed
- Fixed function of relative path calculation for model import. Now the incorrect value of the relative path to the model parameter is taken into account.

## [0.3.1] - 2023-05-11

### Fixed
Fixed relative path calculation mechanism for model, model import and model schema.

## [0.3.0] - 2023-05-11

### Added
- Added new option - useCancelableRequest: Use CancelablePromise wrapper to request

### Fixed
- Added missing parameters in tests

## [0.2.9] - 2023-04-03

- Bump json-schema version

## [0.2.8] - 2022-10-19

### Fixed

- Added the function checks the transition to the directory with a level above and normalizes the path.

## [0.2.7] - 2022-10-01

### Added

- Added cancelable concept

### Fixed

- Fixed incorrect type of error in catchErrors function
- Fixed node version in CI
- Fixed dependencies

## [0.2.6] - 2022-09-18

### Added

- Example project

### Fixed

- Fixed incorrect type of client

## [0.2.5-beta] - 2022-08-07

### Added

- Support sibling element from an external file
- Extract request parameters for service in an particularly type
- Extracted yarn

### Fixed

- Fixed incorrect ordering in sortByRequired

## [0.2.3] - 2022-03-20

### Fixed

- First root path in import block was incorrect when models situated in the same folder as servers(was / , needed ./)

## [0.2.2] - 2022-02-10

## [0.2.2-beta] - 2022-01-19

### Fixed

- Names of inner enums should start with an upper char and has a prefix

## [0.2.1-beta] - 2022-01-15

### Fixed

- Bug with an incorrect paths in a generator input parameters

## [0.2.0-beta] - 2021-12-13

### Added

- Add setting up the tag to the publication(CI)
- The common configuration is moved from the array to the root block
- Output paths for models, services, schemas and core can be set up separately

### Fixed

- Bug with an incorrect prefix which set to an enum if one has property - "type"

## [0.1.32] - 2021-12-03

### Fixed

- Bug with context

## [0.1.30] - 2021-12-01

### Added

- Add prefix to class name (I - interface, E - enum, T - type)

### Fixed

- Starts a class name from a component block with capital char

## [0.1.29] - 2021-11-19

### Added

- Add embedded support axios

### Fixed

- Incorrect a file name if one has extension '.yml'

## [0.1.28] - 2021-11-02

### Fixed

- Mistakes in blocks of import in Windows(backslash)

## [0.1.27] - 2021-10-30

### Added

- Added CHANGELOG.md
