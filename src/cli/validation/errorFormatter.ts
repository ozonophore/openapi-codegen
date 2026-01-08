import { ZodError, ZodIssue } from 'zod';

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
function formatIssue(issue: ZodIssue): string {
    const path = formatPath(issue.path);
    const message = issue.message;

    // Если issue имеет кастомное сообщение, используем его
    if (issue.code === 'custom') {
        return message;
    }

    // Форматируем стандартные ошибки
    switch (issue.code) {
        case 'invalid_type':
            if (issue.received === 'undefined') {
                return `${path}: "${formatPath(issue.path).replace(/^--/, '')}" is required${getContextMessage(issue)}`;
            }
            return `${path}: Expected ${issue.expected}, received ${issue.received}${getContextMessage(issue)}`;

        case 'invalid_enum_value':
            return `${path}: "${issue.received}" is not a valid value. Expected one of: ${issue.options.join(', ')}`;

        case 'invalid_string':
            if ('validation' in issue) {
                if (issue.validation === 'email') {
                    return `${path}: "${formatPath(issue.path).replace(/^--/, '')}" must be a valid email`;
                }
                if (issue.validation === 'url') {
                    return `${path}: "${formatPath(issue.path).replace(/^--/, '')}" must be a valid URL`;
                }
            }
            return `${path}: ${message}`;

        case 'too_small':
            if ('minimum' in issue) {
                const fieldName = formatPath(issue.path).replace(/^--/, '');
                if (issue.type === 'string') {
                    return `${path}: "${fieldName}" must be at least ${issue.minimum} characters long`;
                }
                if (issue.type === 'number') {
                    return `${path}: "${fieldName}" must be at least ${issue.minimum}`;
                }
                if (issue.type === 'array') {
                    return `${path}: "${fieldName}" must contain at least ${issue.minimum} items`;
                }
            }
            return `${path}: ${message}`;

        case 'too_big':
            if ('maximum' in issue) {
                const fieldName = formatPath(issue.path).replace(/^--/, '');
                if (issue.type === 'string') {
                    return `${path}: "${fieldName}" must be at most ${issue.maximum} characters long`;
                }
                if (issue.type === 'number') {
                    return `${path}: "${fieldName}" must be at most ${issue.maximum}`;
                }
                if (issue.type === 'array') {
                    return `${path}: "${fieldName}" must contain at most ${issue.maximum} items`;
                }
            }
            return `${path}: ${message}`;

        case 'invalid_date':
            return `${path}: "${formatPath(issue.path).replace(/^--/, '')}" must be a valid date`;

        case 'invalid_literal':
            return `${path}: Expected literal ${JSON.stringify(issue.expected)}, received ${JSON.stringify(issue.received)}`;

        default:
            return `${path}: ${message}`;
    }
}

/**
 * Форматирует путь к полю в читаемый формат
 */
function formatPath(path: (string | number)[]): string {
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
            return segment;
        })
        .join('.');

    // Для CLI опций добавляем префикс --
    // Проверяем, является ли это именем опции (не вложенным полем)
    if (path.length === 1 && typeof path[0] === 'string') {
        return `--${formattedPath}`;
    }

    return formattedPath;
}

/**
 * Получает дополнительный контекст из issue для улучшения сообщения
 */
function getContextMessage(issue: ZodIssue): string {
    // Если есть union errors, можем добавить информацию о доступных опциях
    if (issue.code === 'invalid_union') {
        return ' (check union options)';
    }

    return '';
}