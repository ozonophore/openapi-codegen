import { Import } from './Import.model';
import type { Operation } from './Operation.model';

export interface Service {
    name: string;
    originName: string;
    operations: Operation[];
    imports: Import[];
}
