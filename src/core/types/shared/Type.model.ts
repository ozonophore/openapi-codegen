import { Import } from './Import.model';

export interface Type {
    type: string;
    base: string;
    template: string | null;
    imports: Import[];
    path: string;
}
