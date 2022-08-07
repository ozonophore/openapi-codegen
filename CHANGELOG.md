# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## unversion

## [0.2.4-beta] - 2022-08-07

###Added

- Support sibling element from an external file
- Extract request parameters for service in an particularly type

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
