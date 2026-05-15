import { OptionValues } from "commander";
import path from "path";

import { Analyzer } from "./core/Analyzer";
import { ProjectContext } from "./core/ProjectContext";
import { Scanner } from "./core/Scanner";
import { Finding, Stats } from "./types";
import { CLICommandResult } from "../types";
import { Reporter } from "./utils/report";

export const analyzeUsage = async (options: OptionValues): Promise<CLICommandResult> => {
    try {
      // Валидация входных данных
      if (!options.sourcePath || !options.projectPath) {
        console.error(
          "❌ Error: --sourcePath (-s) and --projectPath (-p) are required.",
        );
        return { success: false, error: "--sourcePath (-s) and --projectPath (-p) are required." };
      }
      const projectPath = path.resolve(options.projectPath);
      const sourcePath = path.resolve(options.sourcePath);
      const tsconfigPath = options.tsconfigPath
        ? path.resolve(options.tsconfigPath)
        : undefined;

      console.log("🏗️  Initializing project context...");
      const context = new ProjectContext(projectPath, tsconfigPath);

      // Добавляем файл генерации в проект для работы TypeChecker
      const generatedFile = context.project.addSourceFileAtPath(sourcePath);

      console.log("🔍 Scanning API contract...");
      const scanner = new Scanner(generatedFile);
      const contract = scanner.scan();

      // Инициализация объекта статистики для подсчета Coverage
      const stats: Stats = {
        usedMethods: new Set<string>(),
        usedSchemas: new Set<string>(),
        usedModels: new Set<string>(),
      };

      console.log("🧪 Running semantic analysis...");
      const analyzer = new Analyzer(context, contract);
      const findings = await analyzer.run(stats);

      // 1. Расчет покрытия API (через Reporter)
      const coverage = Reporter.calculateCoverage(stats, contract);

      // 2. Вывод результатов в консоль (таблица и сводка)
      Reporter.renderConsole(findings, coverage);

      // 3. Сохранение детального JSON-отчета
      Reporter.saveJsonReport(options.output!, findings, coverage);

      // 4. Логика выхода для CI пайплайнов
      if (options.check) {
        const hasErrors = findings.some((f) => f.severity === "ERROR");
        if (hasErrors) {
          console.error(
            "\n🛑 CI check failed: critical API contract mismatches were found.",
          );
          return { success: false, error: "CI check failed: critical API contract mismatches were found." };
        }
      }

      console.log("\n✅ Done!");
      return { success: true };
    } catch (error: any) {
      console.error(`\n💥 Fatal error: ${error.message}`);
      return { success: false, error: error?.message ?? String(error) };
    }
}
