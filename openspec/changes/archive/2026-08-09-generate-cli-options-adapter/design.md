## Context

Grilling: adapter module from overrides; flat Zod inside adapter; paths preserved; hand OVERRIDE_KEYS + drift test; migrate in CLI.

## Goals / Non-Goals

**Goals:** One adapter call site; no dual Zod in generateOpenApiClient; drift gate.  
**Non-Goals:** EntitySkip; migrate-in-core; Commander surface; fingerprint.

## Decisions

1. `resolveGenerateCliToRawOptions({ clientOptions, validated })` → result union
2. Flat schema + request refine lives in adapter
3. `GENERATE_CLI_OVERRIDE_KEYS` exported; drift test vs `generateOptionsSchema.shape`
4. Rename file to `generateCliOptionsAdapter.ts`; shim re-exports from old path

## Open Questions

_(none)_
