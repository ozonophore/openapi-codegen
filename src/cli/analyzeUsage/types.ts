import type { SourceFile } from 'ts-morph';

import type { ProjectContext } from '../../core/projectProbe';
import type { ApiImportScope } from './utils/apiImportScope';

export interface MethodMetadata {
    name: string;
    params: { name: string; type: string; isOptional: boolean }[];
    returnType: string;
}

export interface Contract {
    services: Record<string, MethodMetadata[]>;
    /** createClient return keys mapped to exported service class names (e.g. SimpleService → SimpleService). */
    clientServiceKeys: Record<string, string>;
    schemas: string[];
    models: string[];
    sourceFile: SourceFile;
}

export interface Finding {
    id: string; // 'MISSING_METHOD' | 'TYPE_MISMATCH'
    severity: 'ERROR' | 'WARNING';
    category: 'INVALID_IMPORT' | 'MISSING_EXPORT' | 'RENAMED_SYMBOL' | 'TYPE_MISMATCH' | 'UNUSED' | 'CONFIG' | 'USAGE';
    message: string;
    file: string;
    line: number;
    context?: any; // Доп. данные (например, suggestion)
}

export interface Stats {
    usedMethods: Set<string>;
    usedSchemas: Set<string>;
    usedModels: Set<string>;
}

export interface CoverageReport {
    methods: { total: number; used: number; percent: string };
    schemas: { total: number; used: number; percent: string };
    models: { total: number; used: number; percent: string };
}

export interface Rule {
    check(context: ProjectContext, contract: Contract, stats: Stats, apiScope: ApiImportScope): Promise<Finding[]>;
}
