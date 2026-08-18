import SwaggerParser from '@apidevtools/swagger-parser';
import fs from 'fs';
import os from 'os';
import path from 'path';

/**
 * Парсит содержимое спецификации, переданное как строка. При YAML создаёт временный файл для парсинга.
 * @param content строковое содержимое спецификации
 * @param sourcePath исходный путь/идентификатор (используется для расширения временного файла)
 * @returns распарсенная спецификация
 */
export const parseOpenApiContent = async (content: string, sourcePath: string): Promise<unknown> => {
    const trimmed = content.trim();
    if (!trimmed) {
        throw new Error(`Specification content is empty: ${sourcePath}`);
    }

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        return JSON.parse(trimmed);
    }

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
