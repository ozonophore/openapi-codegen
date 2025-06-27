# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
