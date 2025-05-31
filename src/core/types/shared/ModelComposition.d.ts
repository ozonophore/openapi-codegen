import { Import } from './Import';
import type { Model } from './Model';

export interface ModelComposition {
    type: 'one-of' | 'any-of' | 'all-of';
    imports: Import[];
    enums: Model[];
    properties: Model[];
}
