import { execSync } from 'child_process';
import path from 'path';

import { parseOpenApiContent } from '../../core/specLoad/parseOpenApiContent';
import type { JsonValue } from './types';

/**
 * Извлекает содержимое файла спецификации из Git по ref и парсит его.
 * @param ref git-реф (например, HEAD~1)
 * @param specPath путь к спецификации в репозитории
 * @returns распарсенная спецификация из git
 */
export const readSpecFromGit = async (ref: string, specPath: string): Promise<JsonValue> => {
    const relativePath = path.isAbsolute(specPath) ? path.relative(process.cwd(), specPath) : specPath;
    const normalizedPath = relativePath.replace(/\\/g, '/');
    const gitCommand = `git show ${ref}:${normalizedPath}`;
    let content: string;
    try {
        content = execSync(gitCommand, { encoding: 'utf-8' });
    } catch (err) {
        const hint = `Failed to read '${specPath}' from git ref '${ref}'. Ensure you run this command in a git repository and the path exists at the specified ref.`;
        throw new Error(`${hint} (${String(err)})`);
    }
    return parseOpenApiContent(content, `${ref}:${normalizedPath}`);
};
