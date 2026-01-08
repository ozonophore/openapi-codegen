import { ZodError } from 'zod';

/**
 * Форматирует Zod ошибку в читаемое сообщение для CLI
 */
export function formatZodErrorForCLI(error: ZodError): string {
    if (!error || error.issues.length === 0) {
        return 'Validation error occurred';
    }

    const messages: string[] = [];

    for (const issue of error.issues) {
        messages.push(formatIssue(issue));
    }

    return messages.join('\n');
}

/**
 * Форматирует отдельную Zod issue в читаемое сообщение
 */
function formatIssue(issue: ZodError['issues'][number]): string {
    const path = formatPath(issue.path);
    const message = issue.message;

    // Если issue имеет кастомное сообщение, используем его
    if (issue.code === 'custom') {
        return message;
    }

    // Форматируем стандартные ошибки с использованием type guards
    if (issue.code === 'invalid_type') {
        if ('received' in issue && issue.received === 'undefined') {
            const fieldName = formatPath(issue.path).replace(/^--/, '');
            return `${path}: "${fieldName}" is required`;
        }
        if ('expected' in issue && 'received' in issue) {
            return `${path}: Expected ${issue.expected}, received ${issue.received}`;
        }
    }

    if (issue.code === 'invalid_format' && 'format' in issue) {
        const fieldName = formatPath(issue.path).replace(/^--/, '');
        const format = issue.format as string;
        if (format === 'email') {
            return `${path}: "${fieldName}" must be a valid email`;
        }
        if (format === 'url') {
            return `${path}: "${fieldName}" must be a valid URL`;
        }
        return `${path}: "${fieldName}" has invalid format: ${format}`;
    }

    if (issue.code === 'too_small' && 'minimum' in issue && 'type' in issue) {
        const fieldName = formatPath(issue.path).replace(/^--/, '');
        const type = issue.type as string;
        const minimum = issue.minimum as number;

        if (type === 'string') {
            return `${path}: "${fieldName}" must be at least ${minimum} characters long`;
        }
        if (type === 'number') {
            return `${path}: "${fieldName}" must be at least ${minimum}`;
        }
        if (type === 'array') {
            return `${path}: "${fieldName}" must contain at least ${minimum} items`;
        }
    }

    if (issue.code === 'too_big' && 'maximum' in issue && 'type' in issue) {
        const fieldName = formatPath(issue.path).replace(/^--/, '');
        const type = issue.type as string;
        const maximum = issue.maximum as number;

        if (type === 'string') {
            return `${path}: "${fieldName}" must be at most ${maximum} characters long`;
        }
        if (type === 'number') {
            return `${path}: "${fieldName}" must be at most ${maximum}`;
        }
        if (type === 'array') {
            return `${path}: "${fieldName}" must contain at most ${maximum} items`;
        }
    }

    if (issue.code === 'invalid_value') {
        const fieldName = formatPath(issue.path).replace(/^--/, '');
        return `${path}: "${fieldName}" has invalid value`;
    }

    if (issue.code === 'unrecognized_keys' && 'keys' in issue) {
        return `${path}: Unrecognized keys: ${(issue.keys as readonly string[]).join(', ')}`;
    }

    // Для всех остальных случаев используем стандартное сообщение
    return `${path}: ${message}`;
}

/**
 * Форматирует путь к полю в читаемый формат
 */
function formatPath(path: (string | number | symbol)[]): string {
    if (path.length === 0) {
        return 'root';
    }

    // Объединяем путь, используя точки для вложенных полей
    // Например: ['options', 'input'] -> 'options.input'
    // Для CLI опций обычно это будет просто название опции: ['input'] -> '--input'
    const formattedPath = path
        .map(segment => {
            if (typeof segment === 'number') {
                return `[${segment}]`;
            }
            if (typeof segment === 'symbol') {
                return `[Symbol(${segment.description || 'unknown'})]`;
            }
            return String(segment);
        })
        .join('.');

    // Для CLI опций добавляем префикс --
    // Проверяем, является ли это именем опции (не вложенным полем)
    if (path.length === 1 && typeof path[0] === 'string') {
        return `--${formattedPath}`;
    }

    return formattedPath;
}
