import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

import type { JsonValue } from './types';

/**
 * Читает и парсит спецификацию из файла. Поддерживает JSON и YAML через SwaggerParser.
 * @param specPath путь к файлу спецификации
 * @returns распарсенная спецификация
 */
export const parseSpecFile = async (specPath: string): Promise<JsonValue> => {
        const content = fs.readFileSync(specPath, 'utf-8');
        const trimmed = content.trim();
    
        if (!trimmed) {
            throw new Error(`Specification file is empty: ${specPath}`);
        }
    
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            return JSON.parse(trimmed);
        }
    
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const SwaggerParser = require('@apidevtools/swagger-parser') as typeof import('@apidevtools/swagger-parser');
        const parser = new SwaggerParser();
        return parser.parse(specPath);
};

/**
 * Парсит содержимое спецификации, переданное как строка. При YAML создаёт временный файл для парсинга.
 * @param content строковое содержимое спецификации
 * @param sourcePath исходный путь/идентификатор (используется для расширения временного файла)
 * @returns распарсенная спецификация
 */
export const parseSpecContent = async (content: string, sourcePath: string): Promise<JsonValue> => {
    const trimmed = content.trim();
        if (!trimmed) {
            throw new Error(`Specification content is empty: ${sourcePath}`);
        }
    
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            return JSON.parse(trimmed);
        }
    
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const SwaggerParser = require('@apidevtools/swagger-parser') as typeof import('@apidevtools/swagger-parser');
        const parser = new SwaggerParser();
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openapi-diff-'));
        const ext = path.extname(sourcePath) || '.yaml';
        const tmpFile = path.join(tmpDir, `spec${ext}`);
    
        try {
            fs.writeFileSync(tmpFile, content, 'utf-8');
            return await parser.parse(tmpFile);
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
};

/**
 * Извлекает содержимое файла спецификации из Git по ref и парсит его.
 * @param ref git-реф (например, HEAD~1)
 * @param specPath путь к спецификации в репозитории
 * @returns распарсенная спецификация из git
 */
export const readSpecFromGit = async (ref: string, specPath: string): Promise<JsonValue> => {
    const relativePath = path.isAbsolute(specPath) ? path.relative(process.cwd(), specPath) : specPath;
    const normalizedPath = path.normalize(relativePath);
        const gitCommand = `git show ${ref}:${normalizedPath}`;
        let content: string;
        try {
            content = execSync(gitCommand, { encoding: 'utf-8' });
        } catch (err) {
            const hint = `Failed to read '${specPath}' from git ref '${ref}'. Ensure you run this command in a git repository and the path exists at the specified ref.`;
            throw new Error(`${hint} (${String(err)})`);
        }
        return parseSpecContent(content, `${ref}:${normalizedPath}`);
};