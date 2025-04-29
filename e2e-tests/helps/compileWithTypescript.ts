import { EOL } from 'os';
import { join, resolve } from 'path';
import {
    createCompilerHost,
    createProgram,
    formatDiagnosticsWithColorAndContext,
    getPreEmitDiagnostics,
    ModuleKind,
    parseConfigFileTextToJson,
    parseJsonConfigFileContent,
    ScriptTarget,
    sys,
} from 'typescript';

interface CompileOptions {
    target: ScriptTarget;
    module: ModuleKind;
    outDir: string;
}

const defaultBaseConfig = {
    compilerOptions: {
        target: ScriptTarget.ES2020,
        moduleResolution: 2, // node
        lib: ['es2020', 'dom'],
        declaration: false,
        sourceMap: false,
        strict: true,
        skipLibCheck: true,
        esModuleInterop: true,
    },
    include: ['**/*.ts'],
};

export const compileWithTypescript = (dir: string) => {
    const cwd = resolve(process.cwd(), `./test/e2e/generated/${dir}`);
    const variants: CompileOptions[] = [
        {
            target: ScriptTarget.ES2020,
            module: ModuleKind.ES2020,
            outDir: join(cwd, 'esm'),
        },
        {
            target: ScriptTarget.ES2020,
            module: ModuleKind.CommonJS,
            outDir: join(cwd, 'cjs'),
        },
    ];

    for (const { target, module, outDir } of variants) {
        // Собираем «виртуальный» tsconfig
        const cfg = {
            ...defaultBaseConfig,
            compilerOptions: {
                ...defaultBaseConfig.compilerOptions,
                target,
                module,
                outDir,
            },
        };
        // Парсим tsconfig → JSON
        const raw = parseConfigFileTextToJson('tsconfig.json', JSON.stringify(cfg));
        const parsed = parseJsonConfigFileContent(raw.config, sys, cwd, undefined, 'tsconfig.json');

        // Создаём программу и хост
        const host = createCompilerHost(parsed.options);
        const program = createProgram(parsed.fileNames, parsed.options, host);
        const { diagnostics, emitSkipped } = program.emit();

        // Собираем все сообщения
        const allDiags = getPreEmitDiagnostics(program).concat(diagnostics);
        if (allDiags.length) {
            const msg = formatDiagnosticsWithColorAndContext(allDiags, {
                getCurrentDirectory: sys.getCurrentDirectory,
                getCanonicalFileName: f => f,
                getNewLine: () => EOL,
            });
            console.error(`\n— ${ModuleKind[module]} build errors:\n`, msg);
            if (emitSkipped) {
                throw new Error(`${ModuleKind[module]} build failed, see diagnostics above`);
            }
        }
    }
};
