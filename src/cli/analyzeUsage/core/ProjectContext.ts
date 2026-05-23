import path from "path";
import type { ProjectOptions } from "ts-morph";
import { Project } from "ts-morph";

export class ProjectContext {
    public readonly project: Project;
    public readonly projectPath: string;

    constructor(projectPath: string, tsConfigPath?: string) {
        this.projectPath = projectPath;
        const options: ProjectOptions = {
            // Очень важно для CLI:
            skipAddingFilesFromTsConfig: false,
        };

        if (tsConfigPath) {
            options.tsConfigFilePath = tsConfigPath;
        } else {
            options.compilerOptions = {
                allowJs: true,
                jsx: 4, // React 17+ (react-jsx)
                target: 99, // ESNext
                moduleResolution: 2, // Node
                esModuleInterop: true,
                // БЕЗ ЭТОГО НЕ БУДЕТ ВИДЕТЬ ТИПЫ БИБЛИОТЕК:
                skipLibCheck: true,
                typeRoots: [path.resolve(projectPath, "node_modules/@types")],
                lib: ["lib.esnext.d.ts", "lib.dom.d.ts"] 
            };
        }

        this.project = new Project(options);

        // Если мы не используем tsconfig, нужно принудительно добавить файлы
        if (!tsConfigPath) {
            console.log('📂 Adding project files manually...');
            this.project.addSourceFilesAtPaths([
                path.join(projectPath, "src/**/*.{ts,tsx}"),
                "!**/node_modules/**",
            ]);
        }

        // ПРОВЕРКА: Проверяем, видит ли проект файлы
        const fileCount = this.project.getSourceFiles().length;
        console.log(`count: ${fileCount} files loaded into context.`);
        
        if (fileCount === 0) {
            throw new Error(`Project at path ${projectPath} is empty or no files were found.`);
        }
    }

    public getTypeChecker() {
        return this.project.getTypeChecker();
    }

    public getSourceFiles() {
        return this.project.getSourceFiles();
    }

    public getConsumerSourceFiles() {
        const srcRoot = path.resolve(this.projectPath, "src") + path.sep;
        return this.project
            .getSourceFiles()
            .filter((file) => file.getFilePath().startsWith(srcRoot));
    }
}
