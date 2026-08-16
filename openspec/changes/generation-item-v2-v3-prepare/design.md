## Context

Grilling locked private helper on item session; switch picks Parser + version logs; parse via callback; one cast in helper; behavioral preserve.

## Goals / Non-Goals

**Goals:** One prepare path; delete duplicate arms.  
**Non-Goals:** Diff wrapper collapse; Write/options/Diff produce; log key changes; public API.

## Decisions

1. `prepareClientFromOpenApi({ parse, openApi, openApiVersion, diffReport, context, miracles, modelsMode })`
2. Switch: `parse: () => new ParserVx(context).parse(openApi as …)` then version log
3. Cast once in helper for applyDiff

## Open Questions

_(none)_
