# `$ref` lookup uses parser keys and URI join, not `path.resolve`

After `SwaggerParser.resolve()`, files are already in `$Refs`. `$ref` lookup must turn a Tree `$ref` plus Parent source file into that parser key (Canonical Ref), not invent a POSIX path and hope it matches. Join with `new URL` against a hand-built `file://` base; match `refs.paths()` allowing only spelling of the same opened file (slashes, encoding, drive-letter case). `pathHelpers` stay for CLI and writing `.ts`, not for `$ref`. `PathApi` is removed.

Terms: `CONTEXT.md` (Language). Steps: `instruction-ref-resolve.md`.

## Considered Options

- **`path.resolve` + `PathApi` (current):** looks right in tests that inject `path.win32` on macOS; production on darwin still treats `C:/...` as relative. Rejected.
- **URI join without matching parser keys:** a second “canonical path” that still drifts from `$Refs`. Rejected.
- **Guess another opened file by filename, or search disk:** hides broken specs and can attach the wrong file. Rejected; unresolved refs stay strict (`get` / `exists`); reporting is Spec/strict, not lookup.

## Consequences

- Callers pass an absolute Parent source file with no Pointer. A Pointer-only Tree `$ref` with no parent uses the Entry file. Relative file `$ref` without a parent is invalid.
- UNC (`\\server\share`) is out of scope until a real spec needs it.
- Semantic diff keeps its own pipeline.
