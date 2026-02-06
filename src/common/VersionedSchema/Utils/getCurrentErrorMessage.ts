import { z } from 'zod';

import { formatZodPath } from '../../Validation/formatZodError';
import { getKeyByMapValue } from './getKeyByMapValue';

export function getCurrentErrorMessage(error: z.ZodError, replaicingKeysMap: Map<string, string>) {
    if (!error || error.issues.length === 0) {
        return;
    }

    const messages = new Set<string>();

    error.issues.forEach(issue => {
        const path = formatZodPath(issue.path);
        const reverseKey = getKeyByMapValue(replaicingKeysMap, path);
        let currentMessage = issue.message;
        if (reverseKey) {
            currentMessage = error.message.replace(path, reverseKey);
        }

        messages.add(currentMessage);
    });

    const result = Array.from(messages.values());

    throw new Error(result.join('\n'));
}
