/* eslint-disable @typescript-eslint/no-unused-vars */
import { ts } from "ts-morph";

import type { ProjectContext } from "../core/ProjectContext";
import type { Contract, Finding, Rule, Stats } from "../types";

export class DiagnosticsRule implements Rule {
  async check(
    context: ProjectContext,
    _contract: Contract,
    _stats: Stats,
  ): Promise<Finding[]> {
    const findings: Finding[] = [];

    for (const file of context.getConsumerSourceFiles()) {
      const hasApiImport = file
        .getImportDeclarations()
        .some((imp) => {
          const moduleName = imp.getModuleSpecifierValue();
          return moduleName === "@lom-api" || moduleName.startsWith("@lom-api/");
        });
      if (!hasApiImport) continue;

      const diagnostics = context.project.getPreEmitDiagnostics().filter((diag) => {
        const sourceFile = diag.getSourceFile();
        return sourceFile?.getFilePath() === file.getFilePath();
      });

      for (const diagnostic of diagnostics) {
        const category = diagnostic.getCategory();
        if (category !== ts.DiagnosticCategory.Error) continue;
        if (diagnostic.getCode() === 2305 || diagnostic.getCode() === 2307) {
          // Covered by ImportRule to avoid duplicate findings for the same import issue.
          continue;
        }

        const line = diagnostic.getLineNumber() ?? 0;
        findings.push({
          id: `TS_DIAGNOSTIC_${diagnostic.getCode()}`,
          category: "TYPE_MISMATCH",
          severity: "ERROR",
          message: diagnostic.getMessageText(),
          file: file.getFilePath(),
          line,
          context: { code: diagnostic.getCode() },
        });
      }
    }

    return findings;
  }
}
