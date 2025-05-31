import { Import } from './Import.model';
import type { Model } from './Model.model';

export interface ModelComposition {
    type: 'one-of' | 'any-of' | 'all-of';
    imports: Import[];
    enums: Model[];
    properties: Model[];
}
