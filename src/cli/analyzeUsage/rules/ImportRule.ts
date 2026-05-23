import type { ProjectContext } from "../core/ProjectContext";
import type { Contract, Finding, Rule, Stats } from "../types";
import { findBestMatch } from "../utils/fuzzy";

export class ImportRule implements Rule {
  async check(
    context: ProjectContext,
    contract: Contract,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _stats: Stats,
  ): Promise<Finding[]> {
    const findings: Finding[] = [];
    const rootExports = new Set(contract.sourceFile.getExportedDeclarations().keys());

    for (const file of context.getConsumerSourceFiles()) {
      for (const imp of file.getImportDeclarations()) {
        const moduleName = imp.getModuleSpecifierValue();
        if (moduleName !== "@lom-api" && !moduleName.startsWith("@lom-api/")) {
          continue;
        }

        const importedSource = imp.getModuleSpecifierSourceFile();
        if (!importedSource) {
          findings.push({
            id: "INVALID_IMPORT_PATH",
            category: "INVALID_IMPORT",
            severity: "ERROR",
            message: `Import "${moduleName}" could not be resolved.`,
            file: file.getFilePath(),
            line: imp.getStartLineNumber(),
          });
          continue;
        }

        const allowedExports =
          moduleName === "@lom-api"
            ? rootExports
            : new Set(importedSource.getExportedDeclarations().keys());

        for (const namedImport of imp.getNamedImports()) {
          const importedName = namedImport.getName();
          if (allowedExports.has(importedName)) continue;

          const suggestion = findBestMatch(importedName, [...allowedExports]);
          findings.push({
            id: "INVALID_IMPORT_NAME",
            category: suggestion ? "RENAMED_SYMBOL" : "MISSING_EXPORT",
            severity: "ERROR",
            message: `Import "${importedName}" is not exported by "${moduleName}".${suggestion ? ` Did you mean "${suggestion}"?` : ""}`,
            file: file.getFilePath(),
            line: namedImport.getStartLineNumber(),
            context: { suggestion },
          });
        }
      }
    }

    return findings;
  }
}
