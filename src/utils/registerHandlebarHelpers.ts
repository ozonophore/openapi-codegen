import * as Handlebars from 'handlebars/runtime';

import { Enum } from '../client/interfaces/Enum';
import { Model } from '../client/interfaces/Model';
import { HttpClient } from '../HttpClient';
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

    // Хелпер для проверки строки
    Handlebars.registerHelper('isString', function (this: any, value, options) {
        return typeof value === 'string' ? options.fn(this) : options.inverse(this);
    });

    // Хелпер для экранирования строк
    Handlebars.registerHelper('escapeString', function (value) {
        if (typeof value === 'string') {
            return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
        }
        return value;
    });

    // Базовые логические хелперы
    Handlebars.registerHelper('eq', function (this: any, a, b, options) {
        return a === b ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('or', function (this: any, a, b, options) {
        return a || b ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('and', function (this: any, a, b, options) {
        return a && b ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('not', function (this: any, value, options) {
        return !value ? options.fn(this) : options.inverse(this);
    });

    // Регистрация хелперов безопасности
    Handlebars.registerHelper('safeName', function (name) {
        // Удаляем опасные символы, оставляя только допустимые для идентификаторов
        return typeof name === 'string' ? name.replace(/[^a-zA-Z0-9_$]/g, '') : name;
    });

    Handlebars.registerHelper('safePath', function (path) {
        // Заменяем опасные символы в путях
        return typeof path === 'string' ? path.replace(/\.\./g, '').replace(/[^a-zA-Z0-9_$\/-]/g, '') : path;
    });

    // Хелперы для сравнения
    Handlebars.registerHelper('ne', (a, b) => a !== b);
}
