## Context

Grilling: derive residual; coverage = OptionsSlice Pick + plugins/disableBuiltinPlugins; allowlist = residual∪slice/plugin keys; keep v3 if identical; tests XOR+snapshot+flip.

## Goals / Non-Goals

**Goals:** One affecting allowlist; residual derived; no silent skip drift.  
**Non-Goals:** Fold into OptionsSlice; expand affecting set; Spec-load git; v4 unless set changes.

## Decisions

1. Allowlist + coverage constants in EntitySkip.ts
2. Residual = pick(item, affecting − coverage), stable key order
3. Version stays 3 while residual ≡ prior hand list

## Open Questions

_(none)_
