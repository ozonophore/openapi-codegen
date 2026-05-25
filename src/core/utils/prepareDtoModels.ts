import type { Client } from '../types/shared/Client.model';
import type { Model } from '../types/shared/Model.model';
import type { MiracleEntry } from '../types/shared/Miracle.model';
import { unique } from './unique';
import { escapeName } from './escapeName';

type NameMapEntry = {
    rawName: string;
    dtoName: string;
};

const stripQuotes = (name: string): string => {
    if (name.startsWith("'") && name.endsWith("'")) {
        return name.slice(1, -1);
    }
    return name;
};

const buildPropertyTarget = (name: string, prefix: string): string => {
    if (name.startsWith("'") && name.endsWith("'")) {
        return `${prefix}[${name}]`;
    }
    return `${prefix}.${name}`;
};

const joinUnique = (items: string[], separator: string): string => items.filter(unique).join(separator);

const buildInlineInterfaceType = (model: Model, resolveType: (m: Model) => string): string => {
    if (!model.properties || model.properties.length === 0) {
        return '{ [key: string]: any }';
    }

    const props = model.properties
        .map(prop => {
            const name = prop.name.startsWith("'") ? prop.name : `'${prop.name}'`;
            const optional = prop.isRequired ? '' : '?';
            const type = resolveType(prop);
            const nullable = prop.isNullable ? ' | null' : '';
            return `${name}${optional}: ${type}${nullable}`;
        })
        .join('; ');

    return `{ ${props} }`;
};

const resolveTypeFactory = (nameMap: Map<string, NameMapEntry>, kind: 'raw' | 'dto') => {
    const resolveType = (model: Model): string => {
        if (model.export === 'reference') {
            const mapped = nameMap.get(model.type);
            return mapped ? (kind === 'raw' ? mapped.rawName : mapped.dtoName) : model.type;
        }

        if (model.export === 'array') {
            const itemModel = model.link ?? { ...model, export: 'reference' as const, link: null };
            const itemType = model.link ? resolveType(itemModel) : resolveType(itemModel);
            return `${itemType}[]`;
        }

        if (model.export === 'dictionary') {
            const itemModel = model.link ?? { ...model, export: 'reference' as const, link: null };
            const itemType = model.link ? resolveType(itemModel) : resolveType(itemModel);
            return `Record<string, ${itemType}>`;
        }

        if (model.export === 'one-of' || model.export === 'any-of') {
            const types = model.properties.map(prop => resolveType(prop));
            const union = joinUnique(types, ' | ');
            return types.length > 1 ? `(${union})` : union || 'any';
        }

        if (model.export === 'all-of') {
            const types = model.properties.map(prop => resolveType(prop));
            const intersection = joinUnique(types, ' & ');
            return types.length > 1 ? `(${intersection})` : intersection || 'any';
        }

        if (model.export === 'enum' && model.enum?.length) {
            return joinUnique(model.enum.map(en => en.value), ' | ') || model.type;
        }

        if (model.export === 'interface') {
            return buildInlineInterfaceType(model, resolveType);
        }

        return model.type || 'any';
    };

    return resolveType;
};

const buildDtoInit = (property: Model, nameMap: Map<string, NameMapEntry>): string => {
    const accessor = buildPropertyTarget(property.name, 'data');
    const defaultSuffix = property.default ? ` ?? ${property.default}` : '';

    const isReference = property.export === 'reference' && nameMap.has(property.type);
    if (isReference) {
        const dtoName = nameMap.get(property.type)!.dtoName;
        if (property.isRequired) {
            return `new ${dtoName}(${accessor})`;
        }
        return `${accessor} ? new ${dtoName}(${accessor}) : undefined`;
    }

    if (property.export === 'array') {
        const itemModel = property.link ?? { ...property, export: 'reference' as const, link: null };
        const itemIsRef = itemModel.export === 'reference' && nameMap.has(itemModel.type);
        if (itemIsRef) {
            const dtoName = nameMap.get(itemModel.type)!.dtoName;
            if (property.isRequired) {
                return `fromArray(${dtoName}, ${accessor})`;
            }
            return `${accessor} ? fromArray(${dtoName}, ${accessor}) : undefined`;
        }
        return `${accessor}${defaultSuffix}`;
    }

    return `${accessor}${defaultSuffix}`;
};

const buildDtoToJson = (property: Model, nameMap: Map<string, NameMapEntry>): string | undefined => {
    const accessor = buildPropertyTarget(property.name, 'this');
    const isReference = property.export === 'reference' && nameMap.has(property.type);
    if (isReference) {
        if (property.isRequired) {
            return `${accessor}.toJSON()`;
        }
        return `${accessor} ? ${accessor}.toJSON() : undefined`;
    }

    if (property.export === 'array') {
        const itemModel = property.link ?? { ...property, export: 'reference' as const, link: null };
        const itemIsRef = itemModel.export === 'reference' && nameMap.has(itemModel.type);
        if (itemIsRef) {
            if (property.isRequired) {
                return `${accessor}.map(item => item.toJSON())`;
            }
            return `${accessor} ? ${accessor}.map(item => item.toJSON()) : undefined`;
        }
    }

    return undefined;
};

const attachDtoGetters = (client: Client): void => {
    const miracles = (client.miracles ?? []).filter(miracle => miracle.type === 'RENAME');
    if (miracles.length === 0) return;

    const miraclesByModel = new Map<string, MiracleEntry[]>();
    for (const miracle of miracles) {
        if (!miracle.modelName || !miracle.oldProperty || !miracle.newProperty) continue;
        const list = miraclesByModel.get(miracle.modelName) ?? [];
        list.push(miracle);
        miraclesByModel.set(miracle.modelName, list);
    }

    client.models.forEach(model => {
        if (!model.isDefinition || model.export !== 'interface') return;
        const entries = miraclesByModel.get(model.name);
        if (!entries || entries.length === 0) return;

        const getters = entries
            .map(entry => {
                const oldName = escapeName(entry.oldProperty ?? '');
                const newName = escapeName(entry.newProperty ?? '');
                if (!oldName || !newName) return null;

                const hasNewProperty = model.properties.some(prop => prop.name === newName);
                if (!hasNewProperty) return null;

                const target = buildPropertyTarget(newName, 'this');
                return {
                    oldName,
                    newName,
                    target,
                    confidence: entry.confidence,
                };
            })
            .filter((item): item is NonNullable<typeof item> => !!item);

        if (getters.length > 0) {
            model.dtoGetters = getters;
        }
    });
};

export const prepareDtoModels = (client: Client): Client => {
    const nameMap = new Map<string, NameMapEntry>();

    client.models.forEach(model => {
        const rawName = `${model.name}Raw`;
        const dtoName = `${model.name}Dto`;
        model.rawName = rawName;
        model.dtoName = dtoName;
        model.dtoKind = model.export === 'interface' ? 'class' : 'alias';
        nameMap.set(model.name, { rawName, dtoName });
    });

    const resolveRaw = resolveTypeFactory(nameMap, 'raw');
    const resolveDto = resolveTypeFactory(nameMap, 'dto');

    client.models.forEach(model => {
        if (!model.isDefinition) {
            return;
        }

        if (model.export !== 'interface') {
            model.rawType = resolveRaw(model);
            model.dtoType = resolveDto(model);
            return;
        }

        model.properties.forEach(property => {
            property.rawType = resolveRaw(property);
            property.dtoType = resolveDto(property);
            property.dtoInit = buildDtoInit(property, nameMap);
            property.dtoToJSON = buildDtoToJson(property, nameMap);
            property.dtoTarget = buildPropertyTarget(property.name, '');
        });
    });

    attachDtoGetters(client);
    return client;
};
