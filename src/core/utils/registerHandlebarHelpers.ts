import * as Handlebars from 'handlebars/runtime';

import { REGEX_BACKSLASH, REGEX_DOT_SLASH, REGEX_LEADING_DOT_SLASH, REGEX_MULTIPLE_SLASHES, REGEX_TRAILING_SLASH } from '../types/Consts';
import { HttpClient } from '../types/enums/HttpClient.enum';
import { Enum } from '../types/shared/Enum.model';
import { Model } from '../types/shared/Model.model';
import { unique } from './unique';

export function registerHandlebarHelpers(root: { httpClient: HttpClient; useOptions: boolean; useUnionTypes: boolean }): void {
    Handlebars.registerHelper('equals', function (this: any, a: string, b: string, options: Handlebars.HelperOptions): string {
        return a === b ? options.fn(this) : options.inverse(this);
    });
    Handlebars.registerHelper('notEquals', function (this: any, a: string, b: string, options: Handlebars.HelperOptions): string {
        return a !== b ? options.fn(this) : options.inverse(this);
    });
    Handlebars.registerHelper('containsSpaces', function (this: any, value: string, options: Handlebars.HelperOptions): string {
        return /\s+/.test(value) ? options.fn(this) : options.inverse(this);
    });
    Handlebars.registerHelper('union', function (this: any, properties: Model[], parent: string | undefined, options: Handlebars.HelperOptions) {
        const type = Handlebars.partials['type'];
        const types = properties.map(property => type({ ...root, ...property, parent }));
        const uniqueTypes = types.filter(unique);
        let uniqueTypesString = uniqueTypes.join(' | ');
        if (uniqueTypes.length > 1) {
            uniqueTypesString = `(${uniqueTypesString})`;
        }
        return options.fn(uniqueTypesString);
    });
    Handlebars.registerHelper('intersection', function (this: any, properties: Model[], parent: string | undefined, options: Handlebars.HelperOptions) {
        const type = Handlebars.partials['type'];
        const types = properties.map(property => type({ ...root, ...property, parent }));
        const uniqueTypes = types.filter(unique);
        let uniqueTypesString = uniqueTypes.join(' & ');
        if (uniqueTypes.length > 1) {
            uniqueTypesString = `(${uniqueTypesString})`;
        }
        return options.fn(uniqueTypesString);
    });
    Handlebars.registerHelper('enumerator', function (this: any, enumerators: Enum[], parent: string | undefined, name: string | undefined, options: Handlebars.HelperOptions) {
        if (!root.useUnionTypes && parent && name) {
            return `${parent}.${name}`;
        }
        return options.fn(
            enumerators
                .map(enumerator => enumerator.value)
                .filter(unique)
                .join(' | ')
        );
    });

    Handlebars.registerHelper('containsSystemName', function (this: any, value: string, options: Handlebars.HelperOptions) {
        const RESERVED_WORDS =
            /^_(arguments|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|eval|export|extends|false|finally|for|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)$/g;
        const hasReservedWords = RESERVED_WORDS.test(value);

        return hasReservedWords ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('normalizePath', function (this: any, path: string) {
        if (!path || typeof path !== 'string') {
            return './';
        }

        let normalizedPath = path
            .replace(REGEX_BACKSLASH, '/')
            .replace(REGEX_MULTIPLE_SLASHES, '/')
            .replace(REGEX_DOT_SLASH, '/')
            .replace(REGEX_LEADING_DOT_SLASH, './')
            .replace(REGEX_TRAILING_SLASH, '');

        if (!normalizedPath.startsWith('./')) {
            normalizedPath = `./${normalizedPath}`;
        }

        if (normalizedPath === '.') {
            return './';
        }

        return normalizedPath;
    });

    Handlebars.registerHelper('joinPath', function (this: any, firstPath: string, secondPath: string) {
        const cleanedFirstPath = firstPath.endsWith('./') ? firstPath.slice(0, -2) : firstPath;
        const cleanedSecondPath = secondPath.startsWith('./') ? secondPath.slice(2) : secondPath;

        return `${cleanedFirstPath}/${cleanedSecondPath}`.replace(REGEX_BACKSLASH, '/').replace(REGEX_MULTIPLE_SLASHES, '/');
    });
}
