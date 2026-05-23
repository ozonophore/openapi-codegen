import { SyntaxKind } from "ts-morph";

import type { ProjectContext } from "../core/ProjectContext";
import type { Contract, Finding, Rule, Stats } from "../types";

export class ModelRule implements Rule {
  async check(
    context: ProjectContext,
    contract: Contract,
    stats: Stats,
  ): Promise<Finding[]> {
    const findings: Finding[] = [];
    const knownModels = new Set(contract.models);

    for (const file of context.getConsumerSourceFiles()) {
      for (const imp of file.getImportDeclarations()) {
        const moduleName = imp.getModuleSpecifierValue();
        if (moduleName !== "@lom-api" && !moduleName.startsWith("@lom-api/")) {
          continue;
        }

        for (const namedImport of imp.getNamedImports()) {
          const importedName = namedImport.getName();
          if (
            importedName.endsWith("Schema") ||
            importedName.endsWith("Service") ||
            importedName === "createClient"
          ) {
            continue;
          }

          const localName = namedImport.getAliasNode()?.getText() || importedName;
          if (!knownModels.has(importedName)) continue;

          const identifiers = file
            .getDescendantsOfKind(SyntaxKind.Identifier)
            .filter((id) => id.getText() === localName);
          const usedOutsideImport = identifiers.some(
            (id) => id.getFirstAncestorByKind(SyntaxKind.ImportDeclaration) == null,
          );
          if (usedOutsideImport) {
            stats.usedModels.add(importedName);
          }
        }
      }
    }

    return findings;
  }
}
