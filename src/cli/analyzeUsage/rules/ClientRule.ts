import { Node,SyntaxKind } from "ts-morph";

import type { ProjectContext } from "../core/ProjectContext";
import type { Contract, Finding, Rule, Stats } from "../types";

export class ClientRule implements Rule {
  async check(
    context: ProjectContext,
    contract: Contract,
    stats: Stats,
  ): Promise<Finding[]> {
    const findings: Finding[] = [];
    const checker = context.getTypeChecker();
    const clientOptionsDecl = contract.sourceFile
      .getExportedDeclarations()
      .get("ClientOptions")?.[0];
    const expectedType = clientOptionsDecl?.getType();

    if (!expectedType) {
      findings.push({
        id: "CLIENT_OPTIONS_TYPE_NOT_FOUND",
        category: "CONFIG",
        severity: "WARNING",
        message:
          "ClientOptions type was not found in the contract. createClient argument validation is limited.",
        file: contract.sourceFile.getFilePath(),
        line: 0,
      });
    }

    for (const file of context.getConsumerSourceFiles()) {
      const imports = file.getImportDeclarations();
      const createClientNames = new Set<string>();

      for (const imp of imports) {
        const moduleName = imp.getModuleSpecifierValue();
        if (moduleName !== "@lom-api" && !moduleName.startsWith("@lom-api/")) {
          continue;
        }
        for (const namedImport of imp.getNamedImports()) {
          if (namedImport.getName() === "createClient") {
            createClientNames.add(namedImport.getAliasNode()?.getText() || "createClient");
          }
        }
      }

      if (createClientNames.size === 0) continue;

      const calls = file.getDescendantsOfKind(SyntaxKind.CallExpression);
      for (const call of calls) {
        const expression = call.getExpression();
        if (!Node.isIdentifier(expression)) continue;
        if (!createClientNames.has(expression.getText())) continue;

        stats.usedMethods.add("createClient");
        const args = call.getArguments();
        if (args.length === 0) continue;

        if (expectedType) {
          const providedType = checker.getTypeAtLocation(args[0]);
          if (!providedType.isAssignableTo(expectedType)) {
            findings.push({
              id: "CLIENT_OPTIONS_MISMATCH",
              category: "TYPE_MISMATCH",
              severity: "ERROR",
              message:
                "createClient configuration object does not match ClientOptions from the generated API.",
              file: file.getFilePath(),
              line: args[0].getStartLineNumber(),
            });
          }
        }
      }
    }

    if (!stats.usedMethods.has("createClient")) {
      findings.push({
        id: "CLIENT_NOT_FOUND",
        category: "USAGE",
        severity: "WARNING",
        message: "No createClient call from @lom-api was found in src.",
        file: "Global",
        line: 0,
      });
    }

    return findings;
  }
}
