import type { DiffInfo } from './DiffInfo.model';
import type { Enum } from './Enum.model';
import { Import } from './Import.model';
import type { Schema } from './Schema.model';

/**
 * Модель OpenAPI-схемы для генерации TypeScript-типов и DTO.
 * @property name имя модели
 * @property alias алиас для экспорта
 * @property path путь к схеме в спецификации
 * @property export способ экспорта модели
 * @property type строковое представление типа
 * @property base базовый тип
 * @property template шаблон generic-типа
 * @property link связанная модель
 * @property description описание схемы
 * @property [default] значение по умолчанию
 * @property imports импорты модели
 * @property enum значения enum
 * @property enums вложенные enum-модели
 * @property properties свойства модели
 * @property [ghostProperties] свойства, удалённые в новой версии API
 * @property [diff] основное diff-изменение свойства
 * @property [structuralDiff] список структурных diff-изменений
 * @property [isGhost] признак ghost-свойства
 * @property [rawName] имя raw-типа в режиме classes
 * @property [dtoName] имя DTO-типа в режиме classes
 * @property [exportName] имя для экспорта в режиме classes
 * @property [rawType] строковое представление raw-типа
 * @property [dtoType] строковое представление DTO-типа
 * @property [dtoInit] инициализатор DTO
 * @property [dtoToJSON] метод сериализации DTO
 * @property [dtoTarget] целевой тип DTO
 * @property [dtoKind] вид DTO: class или alias
 * @property [dtoGetters] геттеры для переименованных свойств
 * @property [needsCoercion] требуется приведение типа
 * @property [coercionFrom] исходный тип приведения
 * @property [coercionTo] целевой тип приведения
 * @property [hasCoercion] признак наличия приведения типа
 */
export interface Model extends Schema {
    name: string;
    alias: string;
    path: string;
    export: 'reference' | 'generic' | 'enum' | 'array' | 'dictionary' | 'interface' | 'one-of' | 'any-of' | 'all-of';
    type: string;
    base: string;
    template: string | null;
    link: Model | null;
    description: string | null;
    default?: string;
    imports: Import[];
    enum: Enum[];
    enums: Model[];
    properties: Model[];
    ghostProperties?: Model[];
    diff?: DiffInfo;
    structuralDiff?: DiffInfo[];
    isGhost?: boolean;
    rawName?: string;
    dtoName?: string;
    exportName?: string;
    rawType?: string;
    dtoType?: string;
    dtoInit?: string;
    dtoToJSON?: string;
    dtoTarget?: string;
    dtoKind?: 'class' | 'alias';
    dtoGetters?: {
        oldName: string;
        newName: string;
        target: string;
        confidence?: number;
    }[];
    needsCoercion?: boolean;
    coercionFrom?: string;
    coercionTo?: string;
    hasCoercion?: boolean;
}
