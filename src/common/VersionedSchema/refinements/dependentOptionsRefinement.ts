import {z} from 'zod';

import { TRawOptions } from "../../TRawOptions";

export function dependentOptionsRefinement(data: TRawOptions, ctx: z.RefinementCtx) {
        // Проверка: либо items, либо input+output должны быть указаны
        const hasItems = data.items && data.items.length > 0;
        const hasInputOutput = !!(data.input && data.output);

        if (!hasItems && !hasInputOutput) {
            ctx.addIssue({
                code: 'custom',
                message: 'Either "items" array or "input" + "output" must be provided',
                path: [],
            });
        }

        // Если есть items, то input и output в корне не должны быть указаны
        if (hasItems && hasInputOutput) {
            ctx.addIssue({
                code: 'custom',
                message: 'Cannot use both "items" array and "input"/"output" at the root level',
                path: ['items'],
            });
        }

        // Валидация: если excludeCoreServiceFiles === true, request не должен быть указан
        if (data.excludeCoreServiceFiles === true && data.request) {
            ctx.addIssue({
                code: 'custom',
                message: '"request" can only be used when "excludeCoreServiceFiles" is false',
                path: ['request'],
            });
        }

        // Валидация для каждого элемента в items
        if (hasItems && data.items) {
            data.items.forEach((item, index) => {
                if (item.request && data.excludeCoreServiceFiles === true) {
                    ctx.addIssue({
                        code: 'custom',
                        message: '"request" in items can only be used when "excludeCoreServiceFiles" is false',
                        path: ['items', index, 'request'],
                    });
                }
            });
        }
    }