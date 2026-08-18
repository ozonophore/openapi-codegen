## Why

`generateOpenApiClient` dual-validates (`generateOptionsSchema` + direct `flatOptionsSchema`) and keeps hand `GENERATE_CLI_OVERRIDE_KEYS` that can drift from schema. Architecture #5: one CLI → `TRawOptions` adapter; hand list + drift test.

## What Changes

- Rename/extend to `generateCliOptionsAdapter.ts` with `resolveGenerateCliToRawOptions`
- Flat Zod refine only inside adapter (direct path)
- Thin `generateOpenApiClient`: Commander Zod → adapter → autoSelect → generate
- Export override keys; unit drift test vs schema shape
- Re-export shim from old `generateCliOverrides.ts` path if needed for imports

## Capabilities

### New Capabilities

- `generate-cli-options-adapter`: Single CLI adapter producing TRawOptions for generate

### Modified Capabilities

_(none)_

## Impact

- `src/cli/generateOpenApiClient/*`, tests; migrate stays CLI; core resolve unchanged
