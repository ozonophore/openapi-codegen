import type { Enum } from './Enum.model';
import { Import } from './Import.model';
import type { Schema } from './Schema.model';

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
}
