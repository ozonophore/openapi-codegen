import { Import } from './Import';
import type { Operation } from './Operation';

export interface Service {
    name: string;
    operations: Operation[];
    imports: Import[];
}
